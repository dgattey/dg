import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const LATEST_SONG_TAG = 'latest-song';

/**
 * Returns the most relevant playback state for UI:
 * - currently playing track if available
 * - otherwise the most recently played track
 * - null if tokens are missing
 *
 * Do not schedule `after()` work here: this 'use cache' scope re-executes
 * during ISR revalidation, PPR resume, and dynamic RSC renders, where
 * `waitUntil` can be unavailable. `after()` then throws (Next error E91)
 * and fatally kills the whole stream — the homepage ships a truncated
 * shell and `/index.rsc` responds with an empty body, so the client dies
 * with "Connection closed". History syncing runs via the
 * /api/spotify/sync cron instead.
 */
export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  return await withMissingTokenFallback(fetchRecentlyPlayed());
};

/**
 * Same data as `getLatestSong`, cached long enough (`minutes`) to be
 * prerendered into the static shell. It can be a few minutes behind, so pair
 * it with `getLatestSong` streamed in for the live value.
 */
export const getLastKnownSong = async () => {
  'use cache';
  cacheLife('minutes');
  cacheTag(LATEST_SONG_TAG);
  return await withMissingTokenFallback(fetchRecentlyPlayed());
};
