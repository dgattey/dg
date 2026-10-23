import 'server-only';

import {
  fetchListeningStats,
  type ListeningStats,
  parseStatsRange,
  type StatsRangeKey,
} from '@dg/services/spotify/fetchListeningStats';
import { cacheLife, cacheTag } from 'next/cache';

const MUSIC_STATS_TAG = 'music-stats';

async function getCachedAllTimeStats(): Promise<ListeningStats | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(MUSIC_STATS_TAG);
  return await fetchListeningStats({ kind: 'all' });
}

async function getCachedRangeStats(
  rangeKey: Exclude<StatsRangeKey, 'all'>,
  knownYears?: Array<{ plays: number; year: number }>,
): Promise<ListeningStats | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(MUSIC_STATS_TAG);
  return await fetchListeningStats(parseStatsRange(rangeKey), { knownYears });
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
  const rangeKey = normalizeStatsRangeKey(rawRange);
  if (rangeKey === 'all') {
    return await getCachedAllTimeStats();
  }
  const allStats = await getCachedAllTimeStats();
  return await getCachedRangeStats(rangeKey, allStats?.years);
}

/**
 * Preloads the three quick-filter snapshots (`all`, `week`, `month`) from `'use cache'`
 * so switching between `All time`, `Last week`, and `Last month` is 0ms on the client.
 */
export async function getInitialListeningStatsSnapshots(): Promise<{
  all: ListeningStats;
  month: ListeningStats | null;
  week: ListeningStats | null;
} | null> {
  const all = await getCachedAllTimeStats();
  if (!all) {
    return null;
  }
  const [week, month] = await Promise.all([
    getCachedRangeStats('week', all.years),
    getCachedRangeStats('month', all.years),
  ]);
  return { all, month, week };
}
