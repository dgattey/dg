import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { exchangeSpotifyCodeForToken } from './exchangeSpotifyCodeForToken';
import { exchangeStravaCodeForToken } from './exchangeStravaCodeForToken';
import { retrieveAndDeleteOauthState } from './oauthStateStorage';

/**
 * Possible results of completing an OAuth callback flow.
 */
export type OauthCallbackResult =
  | { status: 'missing-code' }
  | { status: 'missing-state' }
  | { status: 'invalid-state' }
  | { status: 'unknown-provider' }
  | { status: 'success' }
  | { status: 'error' };

/**
 * Validates callback params, verifies state, exchanges code for a token,
 * and reports a normalized status for the API route to handle.
 */
export async function completeOauthFlow({
  code,
  state,
}: {
  code: string | null;
  state: string | null;
}): Promise<OauthCallbackResult> {
  if (!code) {
    return { status: 'missing-code' };
  }

  if (!state) {
    return { status: 'missing-state' };
  }

  log.info('Received OAuth callback', { code: code.slice(0, 8), stateLength: state.length });

  const storedState = await retrieveAndDeleteOauthState(state);

  if (!storedState) {
    log.error('OAuth state validation failed - state not found or expired');
    return { status: 'invalid-state' };
  }

  const { provider, codeVerifier } = storedState;

  try {
    switch (provider) {
      case 'strava':
        await exchangeStravaCodeForToken(code);
        return { status: 'success' };
      case 'spotify':
        await exchangeSpotifyCodeForToken(code, codeVerifier);
        return { status: 'success' };
      default:
        log.error('Unknown OAuth provider', { provider });
        return { status: 'unknown-provider' };
    }
  } catch (error) {
    log.error('Failed to exchange code for token', { error, provider });
    return { status: 'error' };
  }
}
