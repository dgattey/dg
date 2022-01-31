/**
 * All the possible APIs we support for token usage. There's two
 * strava keys since there's only one possible webhook subscription the
 * Strava API supports. As a result, we need two different Strava
 * apps if we want to both test subscription callback events locally and
 * keep the prod subscription callback running at dylangattey.com.
 *
 * They both use the same DB under the hood, but they use different
 * auth tokens, refresh tokens, and callback URLs. An env variable,
 * process.env.STRAVA_TOKEN_NAME, is used to switch between them. Note that
 * if you're testing webhook events locally, you'll want to create another
 * branch in the Planetscale DB probably so you don't clobber the DB with
 * simultaneous updates from the local webhook + the live webhook.
 */
export type TokenKey = 'spotify' | 'strava' | 'stravaDev';

/**
 * This is what Spotify's refresh token API returns, as raw data
 */
export type RawSpotifyToken = {
  token_type: string;
  access_token: string;
  expires_in: number;
};

/**
 * This is what Strava's refresh token API returns, as raw data
 */
export type RawStravaToken = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
};
