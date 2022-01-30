/* eslint-disable @typescript-eslint/naming-convention */
import { RefreshTokenConfig } from 'api/types/RefreshTokenConfig';
import type { RawSpotifyToken, RawStravaToken, TokenKey } from 'api/types/Token';

/**
 * We "expire" tokens 30 seconds early so we don't run into problems near the end
 * of the window. Probably unneeded but it's just math.
 */
const GRACE_PERIOD_IN_MS = 30000;

/**
 * Given a number of seconds in which something will expire, this function
 * creates a timestamp from that in milliseconds at which things expire.
 */
const createExpirationInMs = (expiryWindowInSeconds: number) =>
  Date.now() - GRACE_PERIOD_IN_MS + expiryWindowInSeconds * 1000;

/**
 * All the APIs we support for refreshing tokens
 */
const REFRESH_TOKEN_CONFIGS: Record<TokenKey, RefreshTokenConfig> = {
  strava: {
    endpoint: 'https://www.strava.com/api/v3/oauth/token',
    data: {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
    },
    validate: (rawData) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { token_type, refresh_token, access_token, expires_at } = rawData as RawStravaToken;
      if (token_type !== 'Bearer' || !refresh_token || !access_token || !expires_at) {
        throw new TypeError('Missing data from Strava to refresh token');
      }
      return {
        refreshToken: refresh_token,
        accessToken: access_token,
        expiryAt: expires_at,
      };
    },
  },

  spotify: {
    endpoint: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
    validate: (rawData, refreshToken) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { token_type, access_token, expires_in } = rawData as RawSpotifyToken;
      if (token_type !== 'Bearer' || !access_token) {
        throw new TypeError('Missing data from Spotify to refresh token');
      }
      // Spotify refresh tokens don't expire + we create our own expiry stamp
      return {
        refreshToken,
        accessToken: access_token,
        expiryAt: createExpirationInMs(expires_in),
      };
    },
  },
};

/**
 * When necessary, gets a new access token/refresh token from Strava
 */
const getRefreshedToken = async (key: TokenKey, refreshToken: string) => {
  const { endpoint, headers, data, validate } = REFRESH_TOKEN_CONFIGS[key];

  const rawData = await fetch<RawStravaToken | RawSpotifyToken>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...headers,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      ...data,
    }),
  });
  if (!rawData.ok) {
    throw new TypeError('Token was not fetched properly');
  }

  // Validate we at least have some data and return it if so
  return validate(await rawData.json(), refreshToken);
};

export default getRefreshedToken;
