import 'server-only';

import { fetchMusicHistoryPage } from '@dg/services/spotify/fetchMusicHistoryPage';
import { cacheLife, cacheTag } from 'next/cache';

const MUSIC_HISTORY_TAG = 'music-history';
const MUSIC_HISTORY_PAGE_SIZE = 24;

type MusicHistoryOptions = {
  before?: Date;
};

type MusicHistoryResult = {
  tracks: Awaited<ReturnType<typeof fetchMusicHistoryPage>>['tracks'];
  nextCursor: string | null;
};

export function parseMusicHistoryCursor(before?: string): Date | undefined {
  if (!before) {
    return undefined;
  }
  const parsed = new Date(before);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

export async function getMusicHistory({
  before,
}: MusicHistoryOptions): Promise<MusicHistoryResult> {
  'use cache';
  cacheLife('weeks');
  cacheTag(MUSIC_HISTORY_TAG);

  return await fetchMusicHistoryPage({
    before,
    pageSize: MUSIC_HISTORY_PAGE_SIZE,
  });
}
