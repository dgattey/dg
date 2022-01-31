import authenticatedRestClient from './authenticatedRestClient';

const BASE_ENDPOINT = 'https://api.spotify.com/v1';

/**
 * A REST client set up to make authed calls to Spotify
 */
const spotifyClient = authenticatedRestClient(BASE_ENDPOINT, 'spotify');
export default spotifyClient;
