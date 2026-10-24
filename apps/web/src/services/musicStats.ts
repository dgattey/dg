import 'server-only';

import { fetchListeningStats, type ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { selectLocalBuckets } from '@dg/services/spotify/listeningStatsQueries';
import {
  parseStatsRange,
  parseStatsRangeKey,
  type StatsRangeKey,
} from '@dg/shared-core/dates/statsRange';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';

async function getCachedYears(): Promise<Array<{ plays: number; year: number }>> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  try {
    const rows = await selectLocalBuckets('year');
    return rows.map((row) => ({ plays: row.plays, year: row.bucket }));
  } catch {
    return [];
  }
}

async function getCachedAllTimeStats(): Promise<ListeningStats | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  return await fetchListeningStats({ kind: 'all' });
}

async function getCachedRangeStats(
  rangeKey: Exclude<StatsRangeKey, 'all'>,
): Promise<ListeningStats | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  const knownYears = await getCachedYears();
  return await fetchListeningStats(
    parseStatsRange(rangeKey),
    knownYears.length > 0 ? { knownYears } : undefined,
  );
}

export async function getListeningStats(rawRange?: string | null): Promise<ListeningStats | null> {
  try {
    const rangeKey = parseStatsRangeKey(rawRange);
    if (rangeKey === 'all') {
      return await getCachedAllTimeStats();
    }
    return await getCachedRangeStats(rangeKey);
  } catch {
    return null;
  }
}

/**
 * Preloads the three quick-filter snapshots (`all`, `week`, `month`) from `'use cache: remote'`
 * so switching between `All time`, `This week`, and `This month` is 0ms on the client.
 */
export async function getInitialListeningStatsSnapshots(): Promise<{
  all: ListeningStats;
  month: ListeningStats | null;
  week: ListeningStats | null;
} | null> {
  try {
    const all = await getCachedAllTimeStats();
    if (!all) {
      return null;
    }
    const [week, month] = await Promise.all([
      getCachedRangeStats('week'),
      getCachedRangeStats('month'),
    ]);
    return { all, month, week };
  } catch {
    return null;
  }
}
