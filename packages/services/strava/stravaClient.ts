import 'server-only';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { createClient } from '../clients/authenticatedRestClient';
import type { RefreshTokenConfig } from '../clients/RefreshTokenConfig';

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

/**
 * Builds the refresh token config for Strava, validating required env vars.
 */
export function getStravaRefreshTokenConfig(): RefreshTokenConfig {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env;
  invariant(STRAVA_CLIENT_ID, 'Missing Strava client id');
  invariant(STRAVA_CLIENT_SECRET, 'Missing Strava client secret');

  return {
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
  };
}

let _stravaClient: ReturnType<typeof createClient> | undefined;

/**
 * A REST client set up to make authed calls to Strava.
 * Lazily initialized so importing this module doesn't require env vars at load time.
 */
export function getStravaClient() {
  _stravaClient ??= createClient({
    accessKey: 'strava',
    endpoint: 'https://www.strava.com/api/v3/',
    refreshTokenConfig: getStravaRefreshTokenConfig(),
  });
  return _stravaClient;
}

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
