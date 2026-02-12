'use server';

import { getMusicHistory, type HistoryTrack, parseMusicHistoryCursor } from './music';

type LoadMoreResult = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

/**
 * Server action for loading more music history in infinite scroll.
 */
export async function loadMoreMusicHistory(beforeCursor: string): Promise<LoadMoreResult> {
  const before = parseMusicHistoryCursor(beforeCursor);
  if (!before) {
    return { nextCursor: null, tracks: [] };
  }
  return await getMusicHistory({ before });
}
