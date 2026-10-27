import 'server-only';

import { fetchListeningStats, type ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { selectLocalBuckets } from '@dg/services/spotify/listeningStatsQueries';
import { calendarDayKey, SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import {
  parseStatsRange,
  parseStatsRangeKey,
  type StatsRangeKey,
} from '@dg/shared-core/dates/statsRange';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';
import { getServerTime } from './getServerTime';

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

/** `today` is part of the cache key so `month` rolls over to the next calendar month. */
async function getCachedRangeStats(
  rangeKey: Exclude<StatsRangeKey, 'all'>,
  today?: string,
): Promise<ListeningStats | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicStats);
  const knownYears = await getCachedYears();
  return await fetchListeningStats(parseStatsRange(rangeKey), {
    ...(knownYears.length > 0 ? { knownYears } : {}),
    ...(today ? { today } : {}),
  });
}

/** Keys `month` by the Pacific day of the cached server time, never an uncached clock. */
async function getRangeStats(
  rangeKey: Exclude<StatsRangeKey, 'all'>,
): Promise<ListeningStats | null> {
  if (rangeKey !== 'month') {
    return await getCachedRangeStats(rangeKey);
  }
  const today = calendarDayKey(await getServerTime(), SITE_TIME_ZONE);
  return await getCachedRangeStats(rangeKey, today);
}

export async function getListeningStats(rawRange?: string | null): Promise<ListeningStats | null> {
  try {
    const rangeKey = parseStatsRangeKey(rawRange);
    if (rangeKey === 'all') {
      return await getCachedAllTimeStats();
    }
    return await getRangeStats(rangeKey);
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
    const [week, month] = await Promise.all([getRangeStats('week'), getRangeStats('month')]);
    return { all, month, week };
  } catch {
    return null;
  }
}
