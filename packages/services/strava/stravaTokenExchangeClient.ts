import 'server-only';
import { createClient } from '../clients/unauthenticatedRestClient';

/**
 * A REST client set up to make unauthed calls to Strava for token exchange.
 * Env var validation is handled by the exchange functions that use this client.
 */
export const stravaTokenExchangeClient = createClient({
  endpoint: 'https://www.strava.com/oauth/token',
});
