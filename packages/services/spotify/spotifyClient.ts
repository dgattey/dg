import 'server-only';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { createClient } from '../clients/authenticatedRestClient';
import type { RefreshTokenConfig } from '../clients/RefreshTokenConfig';

/**
 * This is what Spotify's refresh token API returns, as raw data
 */
type RawSpotifyRefreshToken = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

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
    validate: (rawData, refreshToken) => {
      const {
        token_type: tokenType,
        access_token: accessToken,
        expires_in: expiresIn,
        refresh_token: newRefreshToken,
      } = rawData as RawSpotifyRefreshToken;
      invariant(tokenType === 'Bearer', `Invalid token type from Spotify ${tokenType}`);
      invariant(accessToken, 'Missing access token from Spotify');

      // Spotify refresh tokens don't expire + we create our own expiry stamp
      return {
        accessToken,
        expiryAt: createExpirationDate(expiresIn),
        refreshToken: newRefreshToken ?? refreshToken,
      };
    },
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
