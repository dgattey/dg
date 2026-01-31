/**
 * Any API needs to return this type at the end
 */
export type ValidatedToken = Readonly<{
  refreshToken: string;
  accessToken: string;
  expiryAt: Date;
}>;

/**
 * Represents a config for a particular token key
 */
export type RefreshTokenConfig = Readonly<{
  /**
   * The URL for the refresh token endpoint on the API
   */
  endpoint: string;

  /**
   * This gets encoded into body
   */
  body: (refreshToken: string) => Record<string, string>;

  /**
   * This gets encoded into headers
   */
  headers: Record<string, string>;

  /**
   * Throws an error if anything's off about our data, otherwise returns the data
   */
  validate: (rawData: unknown, existingRefreshToken: string) => ValidatedToken;
}>;
