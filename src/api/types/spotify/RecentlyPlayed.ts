import { Track } from './Track';

/**
 * Represents the return value of the recently played endpoint from Spotify
 */
export type RecentlyPlayed = {
  items: Array<{
    /**
     * The track that was played
     */
    track: Track;

    /**
     * Parseable date time string like 2022-01-28T10:06:57.412Z
     */
    played_at: string;
  }>;

  /**
   * Link to the next page
   */
  next: string;
};
