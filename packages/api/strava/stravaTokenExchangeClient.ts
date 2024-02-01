import { createClient } from 'api-clients/unauthenticatedRestClient';
import { invariant } from 'shared-core/helpers/invariant';

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
invariant(CLIENT_ID, 'Missing STRAVA_CLIENT_ID env variable');
invariant(CLIENT_SECRET, 'Missing STRAVA_CLIENT_SECRET env variable');

/**
 * A REST client set up to make unauthed calls to Strava for token
 * exchange to later make real calls.
 */
export const stravaTokenExchangeClient = createClient({
  endpoint: 'https://www.strava.com/oauth/token',
});
