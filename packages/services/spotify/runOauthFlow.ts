import 'server-only';

import { db } from '@dg/db';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { log } from '@dg/shared-core/helpers/log';
import { maskSecret } from '@dg/shared-core/helpers/maskSecret';

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL ?? '';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? '';
invariant(CALLBACK_URL, 'Missing OAUTH_CALLBACK_URL env variable');
invariant(CLIENT_ID, 'Missing SPOTIFY_CLIENT_ID env variable');
invariant(CLIENT_SECRET, 'Missing SPOTIFY_CLIENT_SECRET env variable');

const SPOTIFY_TOKEN_NAME = 'spotify';
const GRACE_PERIOD_IN_MS = 30_000;

const SCOPES = [
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-state',
];

/**
 * Just a state token to confirm types between the OAuth flow and the callback
 */
export const OAUTH_STATE_TYPE = 'spotifyOauthFlow';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type OauthLinkOptions = {
  /**
   * When true, forces the consent dialog to show even if already authorized.
   * Useful for re-authenticating or switching accounts.
   */
  forceDialog?: boolean;
};

/**
 * Used to start the oauth flow for Spotify. The URL returned by this
 * function needs to be opened in browser for the user to start the
 * flow manually.
 */
export function getSpotifyOauthInitLink({ forceDialog = false }: OauthLinkOptions = {}) {
  invariant(CALLBACK_URL, 'Missing OAUTH_CALLBACK_URL env variable');
  invariant(CLIENT_ID, 'Missing SPOTIFY_CLIENT_ID env variable');

  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', CALLBACK_URL);
  url.searchParams.append('state', OAUTH_STATE_TYPE);
  url.searchParams.append('scope', SCOPES.join(' '));
  if (forceDialog) {
    url.searchParams.append('show_dialog', 'true');
  }
  return url.toString();
}

const createExpirationDate = (expiryDistanceInSeconds: number) =>
  new Date(Date.now() - GRACE_PERIOD_IN_MS + expiryDistanceInSeconds * 1000);

/**
 * Assuming the user has gone through the Spotify OAuth flow and
 * permitted use via the url from `getSpotifyOauthInitLink`, this
 * uses the callback data to get a token by giving back the code.
 * Returns HTML to pass back to the client.
 */
export async function exchangeSpotifyCodeForToken(code: string): Promise<string> {
  log.info('Exchanging code for token for Spotify', { code: maskSecret(code) });

  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    redirect_uri: CALLBACK_URL,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    body,
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const rawTokenData: unknown = await response.json();
  log.info('Got token response', { status: response.status });

  if (!response.ok) {
    log.error('Failed to exchange Spotify code for token', {
      data: rawTokenData,
      status: response.status,
    });
    throw new Error('Failed to exchange Spotify code for token');
  }

  if (!isRecord(rawTokenData)) {
    throw new Error('Invalid Spotify token response');
  }

  const tokenType = rawTokenData.token_type;
  const accessToken = rawTokenData.access_token;
  const refreshToken = rawTokenData.refresh_token;
  const expiresIn = rawTokenData.expires_in;

  if (tokenType !== 'Bearer') {
    throw new Error(`Invalid token type from Spotify ${String(tokenType)}`);
  }
  if (typeof accessToken !== 'string') {
    throw new Error('Missing access token from Spotify');
  }
  if (typeof refreshToken !== 'string') {
    throw new Error('Missing refresh token from Spotify');
  }
  if (typeof expiresIn !== 'number') {
    throw new Error('Missing expires_in from Spotify');
  }

  const expiryAt = createExpirationDate(expiresIn);

  log.info('Persisting token to DB', {
    accessToken: maskSecret(accessToken),
    expiryAt,
    refreshToken: maskSecret(refreshToken),
  });
  const [token] = await db.Token.upsert({
    accessToken,
    expiryAt,
    name: SPOTIFY_TOKEN_NAME,
    refreshToken,
  });
  log.info('Persisted token to DB', { updatedAt: token.updatedAt });

  return `
    <p>Success! Token persisted to ${SPOTIFY_TOKEN_NAME} and expires at ${expiryAt.toLocaleString()}</p>`;
}
