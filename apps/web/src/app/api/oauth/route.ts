import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateSecureState,
} from '@dg/services/oauth/oauthSecurity';
import {
  cleanupExpiredOauthStates,
  retrieveAndDeleteOauthState,
  saveOauthState,
} from '@dg/services/oauth/oauthStateStorage';
import { log } from '@dg/shared-core/logging/log';
import { CONSOLE_ROUTE } from '@dg/shared-core/routes/routes';
import { type NextRequest, NextResponse } from 'next/server';
import { exchangeSpotifyCodeForToken } from '../../../services/spotify';
import { exchangeCodeForToken as exchangeStravaCodeForToken } from '../../../services/strava';

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;

const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

const redirectToConsole = (request: NextRequest) => {
  const url = new URL(CONSOLE_ROUTE, request.url);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
  }
  return NextResponse.redirect(url);
};

/**
 * OAuth provider configurations (server-only, never exposed to client).
 */
const PROVIDER_CONFIGS = {
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
} as const;

type Provider = keyof typeof PROVIDER_CONFIGS;

const isValidProvider = (provider: string): provider is Provider => provider in PROVIDER_CONFIGS;

/**
 * Initiates an OAuth flow by generating secure state and PKCE,
 * storing them in the database, and redirecting to the provider.
 */
async function handleOauthInit(request: NextRequest): Promise<NextResponse> {
  const provider = request.nextUrl.searchParams.get('provider');

  if (!provider || !isValidProvider(provider)) {
    log.error('Invalid OAuth provider', { provider });
    return redirectToConsole(request);
  }

  if (!CALLBACK_URL) {
    log.error('Missing OAUTH_CALLBACK_URL env variable');
    return redirectToConsole(request);
  }

  const config = PROVIDER_CONFIGS[provider];
  const clientId = process.env[config.clientIdEnv];

  if (!clientId) {
    log.error('Missing client ID env variable', { envVar: config.clientIdEnv });
    return redirectToConsole(request);
  }

  // Generate secure state and PKCE (only for providers that support it)
  const state = generateSecureState();
  const codeVerifier = config.supportsPkce ? generateCodeVerifier() : undefined;
  const codeChallenge = codeVerifier ? generateCodeChallenge(codeVerifier) : undefined;

  // Store state in database (avoids cookie domain issues with tunnels)
  await saveOauthState({
    codeVerifier,
    provider,
    state,
  });

  // Opportunistically clean up expired states
  cleanupExpiredOauthStates().catch(() => {
    // Ignore cleanup errors - not critical
  });

  // Build the authorization URL
  const url = new URL(config.authUrl);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', CALLBACK_URL);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', config.scopes);

  if (codeChallenge) {
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
  }

  for (const [key, value] of Object.entries(config.extraParams)) {
    url.searchParams.append(key, value);
  }

  log.info('Initiating OAuth flow', { provider });

  return NextResponse.redirect(url.toString());
}

/**
 * Handles OAuth callback by validating state, exchanging code for token,
 * and redirecting to the console.
 */
async function handleOauthCallback(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!code) {
    return jsonError('Missing authorization code', 400);
  }

  if (!state) {
    return jsonError('Missing state parameter', 400);
  }

  log.info('Received OAuth callback', { code: code.slice(0, 8), stateLength: state.length });

  // Validate state from database (retrieves and deletes in one operation)
  const storedState = await retrieveAndDeleteOauthState(state);

  if (!storedState) {
    log.error('OAuth state validation failed - state not found or expired');
    return jsonError('Invalid or expired OAuth state', 400);
  }

  const { provider, codeVerifier } = storedState;

  try {
    switch (provider) {
      case 'strava':
        await exchangeStravaCodeForToken(code);
        return redirectToConsole(request);
      case 'spotify':
        await exchangeSpotifyCodeForToken(code, codeVerifier);
        return redirectToConsole(request);
      default:
        log.error('Unknown OAuth provider', { provider });
        return jsonError('Unknown OAuth provider', 400);
    }
  } catch (error) {
    log.error('Failed to exchange code for token', { error, provider });
    return jsonError('Could not complete OAuth flow', 500);
  }
}

/**
 * Unified OAuth route handler.
 * - With `provider` param: initiates OAuth flow (redirects to provider)
 * - With `code` param: handles callback (exchanges code for token)
 */
export function GET(request: NextRequest): Promise<NextResponse> {
  const hasProvider = request.nextUrl.searchParams.has('provider');
  const hasCode = request.nextUrl.searchParams.has('code');

  if (hasProvider) {
    return handleOauthInit(request);
  }

  if (hasCode) {
    return handleOauthCallback(request);
  }

  // No valid params - redirect to console
  return Promise.resolve(redirectToConsole(request));
}
