import 'server-only';

import { fetchListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { cacheLife, cacheTag } from 'next/cache';

const MUSIC_STATS_TAG = 'music-stats';

/**
 * Whole-history aggregates move slowly and scan every play, so an hour of
 * staleness buys a lot of database time.
 */
export async function getListeningStats() {
  'use cache';
  cacheLife('hours');
  cacheTag(MUSIC_STATS_TAG);
  return await fetchListeningStats();
}
