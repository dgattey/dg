import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { fetchSpotifyHistoryRows } from '@dg/db';
import { isNotNullish } from '@dg/shared-core/helpers/typeguards';
import { fetchSpotifyTracksByIdsBatched } from './fetchSpotifyTracksByIds';

type HistoryTrack = Track & { playedAt: string };

type SpotifyHistoryPage = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

type SpotifyHistoryPageOptions = {
  before?: Date;
  pageSize?: number;
};

/**
 * Reads stored play rows and hydrates them with full track details.
 */
export async function fetchSpotifyHistoryPage({
  before,
  pageSize = 48,
}: SpotifyHistoryPageOptions): Promise<SpotifyHistoryPage> {
  const plays = await fetchSpotifyHistoryRows({
    before,
    limit: pageSize + 1,
  });

  const hasMore = plays.length > pageSize;
  const pageItems = plays.slice(0, pageSize);
  const lastPlayedAt = pageItems[pageItems.length - 1]?.playedAt;
  const nextCursor = hasMore && lastPlayedAt ? lastPlayedAt.toISOString() : null;

  const trackIds = pageItems.map((play) => play.trackId);
  const tracks = await fetchSpotifyTracksByIdsBatched(trackIds);

  const tracksWithPlayedAt = tracks
    .map((track, index) => {
      const playedAt = pageItems[index]?.playedAt;
      if (!track || !playedAt) {
        return null;
      }
      return {
        ...track,
        playedAt: playedAt.toISOString(),
      };
    })
    .filter(isNotNullish);

  return {
    nextCursor,
    tracks: tracksWithPlayedAt,
  };
}
