import 'server-only';

import { fetchListeningStats, type ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import {
  parseStatsRange,
  parseStatsRangeKey,
  type StatsRangeKey,
} from '@dg/shared-core/dates/statsRange';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';

async function getCachedAllTimeStats(): Promise<ListeningStats | null> {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  return await fetchListeningStats({ kind: 'all' });
}

async function getCachedRangeStats(
  rangeKey: Exclude<StatsRangeKey, 'all'>,
  knownYears?: Array<{ plays: number; year: number }>,
): Promise<ListeningStats | null> {
  'use cache';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  return await fetchListeningStats(parseStatsRange(rangeKey), { knownYears });
}

export async function getListeningStats(rawRange?: string | null): Promise<ListeningStats | null> {
  const rangeKey = parseStatsRangeKey(rawRange);
  if (rangeKey === 'all') {
    return await getCachedAllTimeStats();
  }
  const allStats = await getCachedAllTimeStats();
  return await getCachedRangeStats(rangeKey, allStats?.years);
}

/**
 * Preloads the three quick-filter snapshots (`all`, `week`, `month`) from `'use cache'`
 * so switching between `All time`, `This week`, and `This month` is 0ms on the client.
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
