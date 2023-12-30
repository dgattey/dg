import { invariant } from 'shared-core/helpers/invariant';
import { createClient } from 'api-clients/authenticatedRestClient';

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
  endpoint: 'https://www.strava.com/api/v3',
  accessKey: STRAVA_TOKEN_NAME,
  refreshTokenConfig: {
    endpoint: 'https://www.strava.com/api/v3/oauth/token',
    data: {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
    },
    validate: (rawData) => {
      const {
        token_type: tokenType,
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_at: expiresAt,
      } =
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        rawData as RawStravaRefreshToken;
      invariant(tokenType === 'Bearer', `Invalid token type from Strava ${tokenType}`);
      invariant(refreshToken, 'Missing refresh token from Strava');
      invariant(accessToken, 'Missing access token from Strava');
      invariant(expiresAt, 'Missing expires at from Strava');

      return {
        refreshToken,
        accessToken,
        // expiresAt is a timestamp in seconds!
        expiryAt: new Date(expiresAt * 1000),
      };
    },
  },
});
