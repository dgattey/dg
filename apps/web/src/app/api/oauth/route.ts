import { OAUTH_STATE_TYPE as SPOTIFY_STATE } from '@dg/services/spotify/runOauthFlow';
import { OAUTH_STATE_TYPE as STRAVA_STATE } from '@dg/services/strava/runOauthFlow';
import { log } from '@dg/shared-core/helpers/log';
import { maskSecret } from '@dg/shared-core/helpers/maskSecret';
import { type NextRequest, NextResponse } from 'next/server';
import { exchangeSpotifyCodeForToken } from '../../../services/spotify';
import { exchangeCodeForToken as exchangeStravaCodeForToken } from '../../../services/strava';

type QueryRecord = Partial<Record<string, string | Array<string>>>;

const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

const redirectToDev = (request: NextRequest) => {
  const url = new URL('/dev', request.url);
  // Use http:// for localhost since SSL is not supported locally
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
  }
  return NextResponse.redirect(url);
};

const toQueryRecord = (searchParams: URLSearchParams): QueryRecord =>
  Object.fromEntries(searchParams.entries());

/**
 * Unified OAuth callback handler.
 * Uses the `state` parameter to determine which provider initiated the flow.
 * Redirects to /dev on success.
 */
export async function GET(request: NextRequest) {
  const query = toQueryRecord(request.nextUrl.searchParams);
  const { code, state } = query;

  if (typeof code !== 'string') {
    return jsonError('Missing authorization code', 400);
  }

  log.info('Received OAuth callback', { code: maskSecret(code), state });

  try {
    if (state === STRAVA_STATE) {
      await exchangeStravaCodeForToken(code);
      return redirectToDev(request);
    }

    if (state === SPOTIFY_STATE) {
      await exchangeSpotifyCodeForToken(code);
      return redirectToDev(request);
    }

    log.warn('Unknown OAuth state', { state });
    return jsonError('Unknown OAuth provider', 400);
  } catch (error) {
    log.error('Failed to exchange code for token', { error, state });
    return jsonError('Could not complete OAuth flow', 500);
  }
}
