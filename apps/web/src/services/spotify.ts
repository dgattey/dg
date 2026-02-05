import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { exchangeSpotifyCodeForToken } from '@dg/services/spotify/runOauthFlow';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';
import { withDevTokenRedirect } from './withDevTokenRedirect';

const LATEST_SONG_TAG = 'latest-song';

export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  const track = await withDevTokenRedirect(fetchRecentlyPlayed());
  if (!track?.playedAt) {
    return track;
  }
  return {
    ...track,
    relativePlayedAt: formatRelativeTime({
      fromDate: track.playedAt,
      toDate: Date.now(),
    }),
  };
};

// Token exchange is still provider-specific, needed by /api/oauth callback
export { exchangeSpotifyCodeForToken };
