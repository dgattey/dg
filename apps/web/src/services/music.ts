import 'server-only';

import {
  fetchMusicHistoryPage,
  type HistoryTrack,
} from '@dg/services/spotify/fetchMusicHistoryPage';
import { cacheLife, cacheTag } from 'next/cache';

const MUSIC_HISTORY_TAG = 'music-history';
const MUSIC_HISTORY_PAGE_SIZE = 24;

type MusicHistoryOptions = {
  before?: Date;
};

type MusicHistoryResult = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

/**
 * Parses a cursor string into a Date for pagination.
 */
export function parseMusicHistoryCursor(before?: string): Date | undefined {
  if (!before) {
    return undefined;
  }
  const parsed = new Date(before);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

/**
 * Fetches a page of music listening history with caching.
 */
export async function getMusicHistory({
  before,
}: MusicHistoryOptions): Promise<MusicHistoryResult> {
  'use cache';
  cacheLife('minutes');
  cacheTag(MUSIC_HISTORY_TAG);

  return await fetchMusicHistoryPage({
    before,
    pageSize: MUSIC_HISTORY_PAGE_SIZE,
  });
}

// Re-export HistoryTrack type for consumers
export type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
