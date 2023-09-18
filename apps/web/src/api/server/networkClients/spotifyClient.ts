import { authenticatedRestClient } from './authenticatedRestClient';

const ACCESS_TYPE = 'spotify';
const ENDPOINT = 'https://api.spotify.com/v1';

/**
 * A REST client set up to make authed calls to Spotify
 */
export const spotifyClient = authenticatedRestClient(ENDPOINT, ACCESS_TYPE);
