import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { fetchSpotifyHistoryPage } from '@dg/services/spotify/fetchSpotifyHistoryPage';
import { getSpotifyOauthStatus } from '@dg/services/spotify/getSpotifyOauthStatus';
import {
  exchangeSpotifyCodeForToken,
  getSpotifyOauthInitLink,
} from '@dg/services/spotify/runOauthFlow';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';
import { after } from 'next/server';

const LATEST_SONG_TAG = 'latest-song';
const SPOTIFY_HISTORY_TAG = 'spotify-history';
const SPOTIFY_HISTORY_PAGE_SIZE = 48;

/**
 * Returns the most relevant playback state for UI:
 * - currently playing track if available
 * - otherwise the most recently played track
 */
export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  const track = await fetchRecentlyPlayed();

  after(async () => {
    await syncSpotifyHistoryWithLogging({
      context: 'backfill',
      failureLogLevel: 'warn',
    });
  });

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

type SpotifyHistoryOptions = {
  before?: Date;
};

export const parseSpotifyHistoryCursor = (before?: string | Array<string>) => {
  if (!before) {
    return undefined;
  }
  const value = Array.isArray(before) ? before[0] : before;
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
};

export async function getSpotifyHistory({ before }: SpotifyHistoryOptions) {
  'use cache';
  cacheLife('minutes');
  cacheTag(SPOTIFY_HISTORY_TAG);

  return await fetchSpotifyHistoryPage({
    before,
    pageSize: SPOTIFY_HISTORY_PAGE_SIZE,
  });
}

export { exchangeSpotifyCodeForToken, getSpotifyOauthInitLink, getSpotifyOauthStatus };
