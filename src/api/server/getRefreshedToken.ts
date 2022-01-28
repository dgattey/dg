/* eslint-disable @typescript-eslint/naming-convention */
import type { RawSpotifyToken, RawStravaToken, TokenKey } from 'api/types/Token';

/**
 * Any API needs to return this type at the end
 */
type ValidatedToken = {
  refreshToken: string;
  accessToken: string;
  expiryAt: number;
};

/**
 * Represents a config for a particular token key
 */
type ApiConfig = {
  /**
   * The URL for the API
   */
  endpoint: string;

  /**
   * This gets encoded into body if existent
   */
  data?: Record<string, string | undefined>;

  /**
   * This gets encoded into headers if existent
   */
  headers?: Record<string, string>;

  /**
   * Throws an error if anything's off about our data, otherwise returns the data
   */
  validate: (
    rawData: RawStravaToken | RawSpotifyToken,
    existingRefreshToken: string,
  ) => ValidatedToken;
};

/**
 * All the APIs we support for refreshing tokens
 */
const API_CONFIGS: Record<TokenKey, ApiConfig> = {
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
      // Spotify refresh tokens don't expire, and we want 30 buffer seconds for expiration
      return {
        refreshToken,
        accessToken: access_token,
        expiryAt: (new Date().getSeconds() - 30 + expires_in) * 1000,
      };
    },
  },
};

/**
 * When necessary, gets a new access token/refresh token from Strava
 */
const getRefreshedToken = async (key: TokenKey, refreshToken: string) => {
  const { endpoint, headers, data, validate } = API_CONFIGS[key];
  const rawData = await fetch<RawStravaToken | RawSpotifyToken>(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: JSON.stringify({
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
