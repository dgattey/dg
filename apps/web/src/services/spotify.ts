import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const LATEST_SONG_TAG = 'latest-song';
const LATEST_SONG_FRESH_MS = 1_500;

let cachedLatestSong: { expiresAt: number; track: Track | null } | null = null;
let inFlightLatestSong: Promise<Track | null> | null = null;

/**
 * Returns the live playback state for `loadLatestSong`:
 * - coalesces concurrent calls on the same instance and reuses a 1.5s fresh window
 * - avoids Next.js `'use cache'` `cacheLife('seconds')` (`stale: 30, expire: 60`),
 *   which served stale tracks for up to 60s after a song change on refresh
 */
export const getLatestSong = async (): Promise<Track | null> => {
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return null;
  }
  const useMemoryCache = process.env.NODE_ENV !== 'test';
  if (useMemoryCache && cachedLatestSong && cachedLatestSong.expiresAt > Date.now()) {
    return cachedLatestSong.track;
  }
  if (useMemoryCache && inFlightLatestSong) {
    return inFlightLatestSong;
  }
  const promise = withMissingTokenFallback(fetchRecentlyPlayed()).then((track) => {
    if (useMemoryCache) {
      cachedLatestSong = {
        expiresAt: Date.now() + LATEST_SONG_FRESH_MS,
        track,
      };
    }
    return track;
  });
  if (useMemoryCache) {
    inFlightLatestSong = promise.finally(() => {
      inFlightLatestSong = null;
    });
    return await inFlightLatestSong;
  }
  return await promise;
};

export const getLastKnownSong = async () => {
  'use cache';
  cacheLife('hours');
  cacheTag(LATEST_SONG_TAG);
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return null;
  }
  return await withMissingTokenFallback(fetchRecentlyPlayed());
};
