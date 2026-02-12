import 'server-only';

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { cacheLife, cacheTag } from 'next/cache';
import { after } from 'next/server';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const LATEST_SONG_TAG = 'latest-song';

export const getLatestSong = async () => {
  'use cache';
  cacheLife('seconds');
  cacheTag(LATEST_SONG_TAG);
  const track = await withMissingTokenFallback(fetchRecentlyPlayed());

  after(async () => {
    await syncSpotifyHistoryWithLogging({
      context: 'backfill',
      failureLogLevel: 'warn',
    });
  });

  return track;
};
