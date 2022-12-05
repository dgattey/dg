import { authenticatedRestClient } from './authenticatedRestClient';

const ACCESS_TYPE = process.env.STRAVA_TOKEN_NAME;
const ENDPOINT = 'https://www.strava.com/api/v3';

if (!ACCESS_TYPE) {
  throw new Error('Missing STRAVA_TOKEN_NAME env var');
}

/**
 * A REST client set up to make authed calls to Strava
 */
export const stravaClient = authenticatedRestClient(ENDPOINT, ACCESS_TYPE);
