import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { mapTrackFromApi, type Track, trackApiSchema } from './Track';

/**
 * Schema for Spotify's recently played endpoint.
 */
export const recentlyPlayedApiSchema = v.looseObject({
  items: v.array(
    v.looseObject({
      /**
       * Parseable date time string like 2022-01-28T10:06:57.412Z.
       */
      played_at: v.string(),
      track: trackApiSchema,
    }),
  ),
  /**
   * Link to the next page.
   */
  next: v.optional(v.nullable(v.string())),
});

/**
 * Parsed payload for recently played data.
 */
export type RecentlyPlayedApi = v.InferOutput<typeof recentlyPlayedApiSchema>;

/**
 * Domain payload for recently played data (camelCase).
 */
export type RecentlyPlayed = {
  items: Array<{ track: Track; playedAt: string }>;
  next?: string | null;
};

/**
 * Converts a recently played API response into camelCase data.
 */
export const mapRecentlyPlayedFromApi = (payload: RecentlyPlayedApi): RecentlyPlayed => ({
  items: payload.items
    .map((item) => {
      const track = mapTrackFromApi(item.track);
      return track ? { playedAt: item.played_at, track } : null;
    })
    .filter(isNotNullish),
  next: payload.next,
});
