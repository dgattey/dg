import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { buildAuthorizationUrl } from './buildAuthorizationUrl';
import { createOauthState } from './createOauthState';
import { getProviderConfig, isValidProvider } from './oauthProviderConfig';
import { cleanupExpiredOauthStates, saveOauthState } from './oauthStateStorage';

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;

export type OauthInitResult =
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

  if (!CALLBACK_URL) {
    log.error('Missing OAUTH_CALLBACK_URL env variable');
    return { status: 'missing-callback-url' };
  }

  const config = getProviderConfig(provider);
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
    callbackUrl: CALLBACK_URL,
    clientId,
    codeChallenge,
    config,
    state,
  });

  log.info('Initiating OAuth flow', { provider });

  return { status: 'redirect', url: authorizationUrl };
}
