import { invariant } from 'shared-core/helpers/invariant';
import { createClient } from 'api-clients/authenticatedRestClient';

/**
 * This is what Spotify's refresh token API returns, as raw data
 */
type RawSpotifyRefreshToken = {
  token_type: string;
  access_token: string;
  expires_in: number;
};

/**
 * We "expire" Spotify tokens 30 seconds early so we don't run into problems near the end
 * of the window. Probably unneeded but it's just math.
 */
const GRACE_PERIOD_IN_MS = 30_000;

/**
 * All the env variables we later use
 */
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
invariant(SPOTIFY_CLIENT_ID, 'Missing SPOTIFY_CLIENT_ID env variable');
invariant(SPOTIFY_CLIENT_SECRET, 'Missing SPOTIFY_CLIENT_SECRET env variable');

/**
 * Spotify client needs a base 64 encoded string for the client id:secret
 */
const SPOTIFY_CLIENT_AUTH = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
  'base64',
);

/**
 * Given a number of seconds in which something will expire, this function
 * creates a timestamp from that in milliseconds at which things expire.
 * We intentionally expire with an extra grace period to ensure round trips +
 * other things don't eat up processing time and cause us to miss the expiry timestamp.
 */
function createExpirationDate(expiryDistanceInSeconds: number) {
  return new Date(Date.now() - GRACE_PERIOD_IN_MS + expiryDistanceInSeconds * 1000);
}

/**
 * A REST client set up to make authed calls to Spotify
 */
export const spotifyClient = createClient({
  endpoint: 'https://api.spotify.com/v1/',
  accessKey: 'spotify',
  refreshTokenConfig: {
    endpoint: 'https://accounts.spotify.com/api/token/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${SPOTIFY_CLIENT_AUTH}`,
    },
    body: (refreshToken) => ({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    validate: (rawData, refreshToken) => {
      const { token_type: tokenType, access_token: accessToken, expires_in: expiresIn } =
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        rawData as RawSpotifyRefreshToken;
      invariant(tokenType === 'Bearer', `Invalid token type from Spotify ${tokenType}`);
      invariant(accessToken, 'Missing access token from Spotify');

      // Spotify refresh tokens don't expire + we create our own expiry stamp
      return {
        refreshToken,
        accessToken,
        expiryAt: createExpirationDate(expiresIn),
      };
    },
  },
});
