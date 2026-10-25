import 'server-only';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { isRecord } from '@dg/shared-core/types/typeguards';
import { createClient } from '../clients/authenticatedRestClient';
import type { RefreshTokenConfig, ValidatedToken } from '../clients/RefreshTokenConfig';

/**
 * We "expire" Spotify tokens 30 seconds early so we don't run into problems near the end
 * of the window. Probably unneeded but it's just math.
 */
const GRACE_PERIOD_IN_MS = 30_000;

/**
 * Given a number of seconds in which something will expire, this function
 * creates a timestamp from that in milliseconds at which things expire.
 * We intentionally expire with an extra grace period to ensure round trips +
 * other things don't eat up processing time and cause us to miss the expiry timestamp.
 */
export function createExpirationDate(expiryDistanceInSeconds: number) {
  return new Date(Date.now() - GRACE_PERIOD_IN_MS + expiryDistanceInSeconds * 1000);
}

export function validateSpotifyTokenResponse(
  rawData: unknown,
  existingRefreshToken?: string,
): ValidatedToken {
  invariant(isRecord(rawData), 'Invalid Spotify token response');
  const tokenType = rawData.token_type;
  const accessToken = rawData.access_token;
  const expiresIn = rawData.expires_in;
  const refreshToken =
    typeof rawData.refresh_token === 'string' ? rawData.refresh_token : existingRefreshToken;

  invariant(tokenType === 'Bearer', `Invalid token type from Spotify ${String(tokenType)}`);
  invariant(typeof accessToken === 'string' && accessToken, 'Missing access token from Spotify');
  invariant(typeof refreshToken === 'string' && refreshToken, 'Missing refresh token from Spotify');
  invariant(typeof expiresIn === 'number', 'Missing expires_in from Spotify');

  return {
    accessToken,
    expiryAt: createExpirationDate(expiresIn),
    refreshToken,
  };
}

/**
 * Builds the refresh token config for Spotify, validating required env vars.
 */
export function getSpotifyRefreshTokenConfig(): RefreshTokenConfig {
  const { SPOTIFY_CLIENT_ID } = process.env;
  invariant(SPOTIFY_CLIENT_ID, 'Missing SPOTIFY_CLIENT_ID env variable');

  return {
    body: (refreshToken) => ({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    endpoint: 'https://accounts.spotify.com/api/token/',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validate: validateSpotifyTokenResponse,
  };
}

let _spotifyClient: ReturnType<typeof createClient> | undefined;

/**
 * A REST client set up to make authed calls to Spotify.
 * Lazily initialized so importing this module doesn't require env vars at load time.
 */
export function getSpotifyClient() {
  _spotifyClient ??= createClient({
    accessKey: 'spotify',
    endpoint: 'https://api.spotify.com/v1/',
    refreshTokenConfig: getSpotifyRefreshTokenConfig(),
  });
  return _spotifyClient;
}
