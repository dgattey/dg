import { RawSpotifyToken, RawStravaToken } from './RawToken';

/**
 * Any API needs to return this type at the end
 */
type ValidatedToken = {
  refreshToken: string;
  accessToken: string;
  expiryAt: Date;
};

/**
 * Represents a config for a particular token key
 */
export type RefreshTokenConfig = {
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
