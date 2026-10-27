import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { fetchTrackBpm } from '@dg/services/spotify/fetchTrackBpm';
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

/**
 * A recording's tempo never changes, so a result, including an unknown tempo,
 * is cached for weeks and each ISRC costs one Deezer request across every
 * server instance. Failures and timeouts resolve to an unknown tempo cached
 * for about an hour, so a Deezer outage costs at most one slow request per
 * song per hour.
 */
async function getTrackBpm(isrc: string): Promise<number | null> {
  'use cache: remote';
  try {
    const bpm = await fetchTrackBpm(isrc);
    cacheLife('weeks');
    return bpm;
  } catch (error) {
    log.warn('Track tempo lookup failed; using the default bounce', { error, isrc });
    cacheLife('hours');
    return null;
  }
}

async function withTrackBpm(track: Track | null): Promise<Track | null> {
  if (!track?.isrc) {
    return track;
  }
  const bpm = await getTrackBpm(track.isrc);
  return bpm === null ? track : { ...track, bpm };
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
