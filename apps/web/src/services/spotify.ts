import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';

const LATEST_SONG_TAG = 'latest-song';

export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  const track = await fetchRecentlyPlayed();
  if (!track?.played_at) {
    return track;
  }
  return {
    ...track,
    relativePlayedAt: formatRelativeTime({
      fromDate: track.played_at,
      toDate: Date.now(),
    }),
  };
};
