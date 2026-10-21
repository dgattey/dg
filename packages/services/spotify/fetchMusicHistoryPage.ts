import 'server-only';

import { db, Op } from '@dg/db';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { resolveTrackDisplays } from './trackDisplays';

/**
 * Lightweight history track for UI rendering.
 * Uses valibot for schema definition and runtime validation.
 */
export const historyTrackSchema = v.object({
  albumId: v.string(),
  albumImageUrl: v.string(),
  albumName: v.string(),
  /** Spotify album page, empty when we never captured one. */
  albumUrl: v.string(),
  artistNames: v.string(),
  playedAt: v.string(),
  trackId: v.string(),
  trackName: v.string(),
  url: v.string(),
});

export type HistoryTrack = v.InferOutput<typeof historyTrackSchema>;

type MusicHistoryPage = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

type MusicHistoryPageOptions = {
  before?: Date;
  pageSize?: number;
};

type SpotifyHistoryRow = {
  playedAt: Date;
  trackId: string;
};

const DEFAULT_PAGE_SIZE = 24;

/**
 * Fetches SpotifyPlay rows from the database.
 */
function fetchSpotifyPlayRows({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<Array<SpotifyHistoryRow>> {
  const whereClause = before ? { playedAt: { [Op.lt]: before } } : {};
  return db.SpotifyPlay.findAll({
    attributes: ['playedAt', 'trackId'],
    limit: pageSize + 1,
    order: [['playedAt', 'DESC']],
    where: whereClause,
  });
}

/**
 * Fetches a page of music history with efficient caching.
 *
 * Reads a page of SpotifyPlay rows, then resolves each track through the
 * Music* cache (fetching and writing through any misses).
 */
export async function fetchMusicHistoryPage({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<MusicHistoryPage> {
  const plays = await fetchSpotifyPlayRows({ before, pageSize });

  const hasMore = plays.length > pageSize;
  const pageItems = plays.slice(0, pageSize);
  const lastPlayedAt = pageItems[pageItems.length - 1]?.playedAt;
  const nextCursor = hasMore && lastPlayedAt ? lastPlayedAt.toISOString() : null;

  if (pageItems.length === 0) {
    return { nextCursor: null, tracks: [] };
  }

  const displays = await resolveTrackDisplays(pageItems.map((play) => play.trackId));

  const tracks = pageItems
    .map((play) => {
      const display = displays.get(play.trackId);
      if (!display) {
        return null;
      }
      return v.parse(historyTrackSchema, {
        albumId: display.albumId,
        albumImageUrl: display.albumImageUrl,
        albumName: display.albumName,
        albumUrl: display.albumUrl,
        artistNames: display.artistNames,
        playedAt: play.playedAt.toISOString(),
        trackId: display.id,
        trackName: display.name,
        url: display.url,
      });
    })
    .filter(isNotNullish);

  return { nextCursor, tracks };
}
