/* eslint-disable @typescript-eslint/naming-convention */
import { RefreshTokenConfig } from 'api/types/RefreshTokenConfig';
import type { RawSpotifyToken, RawStravaToken } from 'api/types/RawToken';

/**
 * We "expire" tokens 30 seconds early so we don't run into problems near the end
 * of the window. Probably unneeded but it's just math.
 */
const GRACE_PERIOD_IN_MS = 30_000;

/**
 * All the env variables we later use
 */
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } =
  process.env;

/**
 * Spotify client needs a string for the client id:secret
 */
const SPOTIFY_CLIENT_AUTH =
  SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET ? `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}` : '';

/**
 * Given a number of seconds in which something will expire, this function
 * creates a timestamp from that in milliseconds at which things expire.
 */
const createExpirationDate = (expiryWindowInSeconds: number) =>
  new Date(Date.now() - GRACE_PERIOD_IN_MS + expiryWindowInSeconds * 1000);

// This is shared
const STRAVA_REFRESH_TOKEN_CONFIG: RefreshTokenConfig = {
  endpoint: 'https://www.strava.com/api/v3/oauth/token',
  data: {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
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
      // expires_at is a timestamp in seconds!
      expiryAt: new Date(expires_at * 1000),
    };
  },
};

/**
 * All the APIs we support for refreshing tokens
 */
const REFRESH_TOKEN_CONFIGS: Record<string, RefreshTokenConfig> = {
  strava: STRAVA_REFRESH_TOKEN_CONFIG,
  stravaDev: STRAVA_REFRESH_TOKEN_CONFIG,

  spotify: {
    endpoint: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: `Basic ${Buffer.from(SPOTIFY_CLIENT_AUTH).toString('base64')}`,
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
        expiryAt: createExpirationDate(expires_in),
      };
    },
  },
};

/**
 * When necessary, gets a new access token/refresh token from the API
 */
export const fetchRefreshedTokenFromApi = async (key: string, refreshToken: string) => {
  const refreshTokenConfig = REFRESH_TOKEN_CONFIGS[key];
  if (!refreshTokenConfig) {
    throw new TypeError(`No refresh token config for ${key}`);
  }

  const { endpoint, headers, data, validate } = refreshTokenConfig;

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
