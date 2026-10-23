import 'server-only';

import {
  fetchListeningStats,
  type ListeningStats,
  parseStatsRange,
  type StatsRangeKey,
} from '@dg/services/spotify/fetchListeningStats';
import { cacheLife, cacheTag } from 'next/cache';

const MUSIC_STATS_TAG = 'music-stats';

async function getCachedListeningStats(rangeKey: StatsRangeKey): Promise<ListeningStats | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(MUSIC_STATS_TAG);
  return await fetchListeningStats(parseStatsRange(rangeKey));
}

export function normalizeStatsRangeKey(raw?: string | null): StatsRangeKey {
  const parsed = parseStatsRange(raw);
  switch (parsed.kind) {
    case 'all':
      return 'all';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    case 'year':
      return `${parsed.year}`;
    default: {
      const unhandled: never = parsed;
      return unhandled;
    }
  }
}

/**
 * Aggregates over SpotifyPlay history for the requested range, cached for an hour.
 */
export async function getListeningStats(rawRange?: string | null): Promise<ListeningStats | null> {
  return await getCachedListeningStats(normalizeStatsRangeKey(rawRange));
}
