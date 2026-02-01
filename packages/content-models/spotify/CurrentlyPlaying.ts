import * as v from 'valibot';
import { mapTrackFromApi, type Track, trackApiSchema } from './Track';

/**
 * Schema for Spotify's currently playing endpoint.
 */
export const currentlyPlayingApiSchema = v.looseObject({
  /**
   * Whether the user is currently playing something.
   */
  is_playing: v.boolean(),
  /**
   * Track being played, if any.
   */
  item: v.nullable(trackApiSchema),
  /**
   * Current playback progress.
   */
  progress_ms: v.optional(v.number()),
});

/**
 * Parsed payload for currently playing data.
 */
export type CurrentlyPlayingApi = v.InferOutput<typeof currentlyPlayingApiSchema>;

/**
 * Domain payload for currently playing data (camelCase).
 */
export type CurrentlyPlaying = {
  isPlaying: boolean;
  progressMs?: number;
  item: Track | null;
};

/**
 * Converts a currently playing API response into camelCase data.
 */
export const mapCurrentlyPlayingFromApi = (payload: CurrentlyPlayingApi): CurrentlyPlaying => ({
  isPlaying: payload.is_playing,
  item: payload.item ? mapTrackFromApi(payload.item) : null,
  progressMs: payload.progress_ms,
});
