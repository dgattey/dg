import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { generateCodeChallenge, generateCodeVerifier, generateSecureState } from './oauthSecurity';
import { cleanupExpiredOauthStates, saveOauthState } from './oauthStateStorage';

type OauthProviderConfig = {
  authUrl: string;
  clientIdEnv: string;
  extraParams: Record<string, string>;
  scopes: string;
  supportsPkce: boolean;
};

const PROVIDER_CONFIGS: Record<OauthProviderKey, OauthProviderConfig> = {
  spotify: {
    authUrl: 'https://accounts.spotify.com/authorize',
    clientIdEnv: 'SPOTIFY_CLIENT_ID',
    extraParams: { show_dialog: 'true' },
    scopes: 'user-read-recently-played user-read-currently-playing user-read-playback-state',
    supportsPkce: true,
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    clientIdEnv: 'STRAVA_CLIENT_ID',
    extraParams: { approval_prompt: 'force', grant_type: 'authorization_code' },
    scopes: 'read,activity:read_all,profile:read_all,read_all',
    supportsPkce: false,
  },
};

const isValidProvider = (provider: string): provider is OauthProviderKey =>
  Object.hasOwn(PROVIDER_CONFIGS, provider);

const createOauthState = (supportsPkce: boolean) => {
  const state = generateSecureState();
  if (!supportsPkce) {
    return { state };
  }
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { codeChallenge, codeVerifier, state };
};

const buildAuthorizationUrl = ({
  callbackUrl,
  clientId,
  codeChallenge,
  config,
  state,
}: {
  callbackUrl: string;
  clientId: string;
  codeChallenge?: string;
  config: OauthProviderConfig;
  state: string;
}) => {
  const url = new URL(config.authUrl);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', callbackUrl);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', config.scopes);

  if (codeChallenge) {
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
  }

  for (const [key, value] of Object.entries(config.extraParams)) {
    url.searchParams.append(key, value);
  }

  return url.toString();
};

type OauthInitResult =
  | { status: 'redirect'; url: string }
  | { status: 'invalid-provider' }
  | { status: 'missing-callback-url' }
  | { status: 'missing-client-id'; envVar: string };

/**
 * Validates the provider, creates state/PKCE, stores the state, and returns
 * the provider redirect URL (or error status when prerequisites are missing).
 */
export async function initiateOauthFlow(provider: string | null): Promise<OauthInitResult> {
  if (!provider || !isValidProvider(provider)) {
    log.error('Invalid OAuth provider', { provider });
    return { status: 'invalid-provider' };
  }

  const callbackUrl = process.env.OAUTH_CALLBACK_URL;
  if (!callbackUrl) {
    log.error('Missing OAUTH_CALLBACK_URL env variable');
    return { status: 'missing-callback-url' };
  }

  const config = PROVIDER_CONFIGS[provider];
  const clientId = process.env[config.clientIdEnv];

  if (!clientId) {
    log.error('Missing client ID env variable', { envVar: config.clientIdEnv });
    return { envVar: config.clientIdEnv, status: 'missing-client-id' };
  }

  const { codeChallenge, codeVerifier, state } = createOauthState(config.supportsPkce);

  await saveOauthState({
    codeVerifier,
    provider,
    state,
  });

  cleanupExpiredOauthStates().catch(() => {
    // Ignore cleanup errors - not critical
  });

  const authorizationUrl = buildAuthorizationUrl({
    callbackUrl,
    clientId,
    codeChallenge,
    config,
    state,
  });

  log.info('Initiating OAuth flow', { provider });

  return { status: 'redirect', url: authorizationUrl };
}
