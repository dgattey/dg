import { createClient } from 'api-clients/authenticatedRestClient';
import { invariant } from 'shared-core/helpers/invariant';

/**
 * This is what Strava's refresh token API returns, as raw data
 */
type RawStravaRefreshToken = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
};

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_TOKEN_NAME } = process.env;
invariant(STRAVA_TOKEN_NAME, 'Missing Strava token name (used as access key)');
invariant(STRAVA_CLIENT_ID, 'Missing Strava client id');
invariant(STRAVA_CLIENT_SECRET, 'Missing Strava client secret');

/**
 * A REST client set up to make authed calls to Strava
 */
export const stravaClient = createClient({
  accessKey: STRAVA_TOKEN_NAME,
  endpoint: 'https://www.strava.com/api/v3/',
  refreshTokenConfig: {
    body: (refreshToken) => ({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    // Note: it's REALLY FUCKING IMPORTANT that this doesn't have a slash at the end. It returns empty otherwise
    endpoint: 'https://www.strava.com/api/v3/oauth/token',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    validate: validateRawDataToToken,
  },
});

/**
 * Parses raw data to a token/access token from expected data
 */
export function validateRawDataToToken(rawData: unknown): {
  refreshToken: string;
  accessToken: string;
  expiryAt: Date;
} {
  invariant(rawData !== null && typeof rawData === 'object', `Not an object from Strava`);

  const {
    token_type: tokenType,
    refresh_token: refreshToken,
    access_token: accessToken,
    expires_at: expiresAt,
  } = rawData as RawStravaRefreshToken;
  invariant(tokenType === 'Bearer', `Invalid token type from Strava ${tokenType}`);
  invariant(refreshToken, 'Missing refresh token from Strava');
  invariant(accessToken, 'Missing access token from Strava');
  invariant(expiresAt, 'Missing expires at from Strava');

  return {
    accessToken,
    // expiresAt is a timestamp in seconds!
    expiryAt: new Date(expiresAt * 1000),
    refreshToken,
  };
}
