import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { getSpotifyOauthStatus } from '@dg/services/spotify/getSpotifyOauthStatus';
import {
  exchangeSpotifyCodeForToken,
  getSpotifyOauthInitLink,
} from '@dg/services/spotify/runOauthFlow';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';

const LATEST_SONG_TAG = 'latest-song';

export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  const track = await fetchRecentlyPlayed();
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

export { exchangeSpotifyCodeForToken, getSpotifyOauthInitLink, getSpotifyOauthStatus };
