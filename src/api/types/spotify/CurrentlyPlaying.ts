import { Track } from './Track';

/**
 * This reflects what I care about from Spotify's currently playing endpoint.
 */
export type CurrentlyPlaying = {
  is_playing: boolean;

  /**
   * Distance through the song currently
   */
  progress_ms: number;

  /**
   * Total length of song
   */
  duration_ms: number;

  /**
   * The song with its related info about artist/album
   */
  item: Track;
};
