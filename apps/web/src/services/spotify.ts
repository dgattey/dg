import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { getTrackBpm } from '@dg/services/spotify/trackTempo';
import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';

const LATEST_SONG_FRESH_MS = 1_500;

async function withMissingTokenFallback<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isMissingTokenError(error)) {
      return null;
    }
    log.warn('Latest song read failed; degrading to empty state', { error });
    return null;
  }
}

async function withTrackBpm(track: Track | null): Promise<Track | null> {
  if (!track?.isrc) {
    return track;
  }
  try {
    const bpm = await getTrackBpm(track.isrc);
    return bpm === null ? track : { ...track, bpm };
  } catch (error) {
    log.warn('Stored track tempo read failed; using the default bounce', { error });
    return track;
  }
}

async function readLatestTrack(): Promise<Track | null> {
  return await withTrackBpm(await withMissingTokenFallback(fetchRecentlyPlayed()));
}

let cachedLatestSong: { expiresAt: number; track: Track | null } | null = null;
let inFlightLatestSong: Promise<Track | null> | null = null;

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
  const promise = readLatestTrack().then((track) => {
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
  cacheLife('max');
  cacheTag(CACHE_TAGS.latestSong);
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return null;
  }
  return await readLatestTrack();
};
