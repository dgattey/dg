import { isTokenKey } from '@dg/api/parsers';
import authenticatedRestClient from './authenticatedRestClient';

const BASE_ENDPOINT = 'https://www.strava.com/api/v3';

if (!isTokenKey(process.env.STRAVA_TOKEN_NAME)) {
  throw new TypeError('Missing Strava DB Token Name');
}

/**
 * A REST client set up to make authed calls to Strava
 */
const stravaClient = authenticatedRestClient(BASE_ENDPOINT, process.env.STRAVA_TOKEN_NAME);
export default stravaClient;
