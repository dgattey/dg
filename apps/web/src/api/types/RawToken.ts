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
