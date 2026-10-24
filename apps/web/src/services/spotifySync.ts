import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import {
  getLatestPlayedAt,
  syncSpotifyHistoryWithLogging,
} from '@dg/services/spotify/syncSpotifyHistory';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { getFavoriteAlbums } from './albums';
import { CACHE_TAGS } from './cacheTags';

export const STALE_SPOTIFY_SYNC_INTERVAL_MS = 20 * 60 * 1000;
export const FAVORITE_ALBUMS_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const PLAYED_AT_SKEW_TOLERANCE_MS = 10_000;
const FRESH_WINDOW_START_TOLERANCE_MS = 5_000;

let lastSyncCheckedAtMs = 0;
let lastFavoriteAlbumsCheckedAtMs = 0;
let lastKnownLatestPlayedAtMs = 0;
let lastObservedTrackKey: string | null = null;
let syncInFlight = false;

export function resetSpotifySyncStateForTests(): void {
  lastSyncCheckedAtMs = 0;
  lastFavoriteAlbumsCheckedAtMs = 0;
  lastKnownLatestPlayedAtMs = 0;
  lastObservedTrackKey = null;
  syncInFlight = false;
}

async function readCachedLatestPlayedAtIso(): Promise<string | null> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(CACHE_TAGS.musicHistory);
  cacheTag(CACHE_TAGS.latestSong);
  const latest = await getLatestPlayedAt();
  return latest ? latest.toISOString() : null;
}

export async function getCachedLatestPlayedAt(): Promise<Date | null> {
  const dbLatestIso = await readCachedLatestPlayedAtIso().catch(() => null);
  const dbMs = dbLatestIso ? Date.parse(dbLatestIso) : Number.NaN;
  const newestMs = Math.max(Number.isNaN(dbMs) ? 0 : dbMs, lastKnownLatestPlayedAtMs);
  if (newestMs > 0) {
    lastKnownLatestPlayedAtMs = newestMs;
    return new Date(newestMs);
  }
  return null;
}

async function getFavoriteAlbumsWindowStartMs(): Promise<number> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.favoriteAlbumsCheck);
  return await Promise.resolve(Date.now());
}

export async function shouldRefreshFavoriteAlbums(nowMs = Date.now()): Promise<boolean> {
  if (
    lastFavoriteAlbumsCheckedAtMs > 0 &&
    nowMs - lastFavoriteAlbumsCheckedAtMs < FAVORITE_ALBUMS_CHECK_INTERVAL_MS
  ) {
    return false;
  }
  try {
    const windowStartMs = await getFavoriteAlbumsWindowStartMs();
    const ageMs = nowMs - windowStartMs;
    if (ageMs >= FRESH_WINDOW_START_TOLERANCE_MS && ageMs < FAVORITE_ALBUMS_CHECK_INTERVAL_MS) {
      lastFavoriteAlbumsCheckedAtMs = windowStartMs;
      return false;
    }
    if (ageMs >= FAVORITE_ALBUMS_CHECK_INTERVAL_MS) {
      revalidateTag(CACHE_TAGS.favoriteAlbumsCheck, 'max');
    }
  } catch {}
  lastFavoriteAlbumsCheckedAtMs = nowMs;
  return true;
}

export async function syncSpotifyIfStale(
  nowMs = Date.now(),
  track?: Track | null,
): Promise<boolean> {
  if (syncInFlight) {
    return false;
  }

  const knownLatestPlayedAt = await getCachedLatestPlayedAt();
  const trackPlayedAtMs = track?.playedAt ? new Date(track.playedAt).getTime() : Number.NaN;
  const hasNewerFinishedPlay =
    !Number.isNaN(trackPlayedAtMs) &&
    (knownLatestPlayedAt === null ||
      trackPlayedAtMs - knownLatestPlayedAt.getTime() > PLAYED_AT_SKEW_TOLERANCE_MS);

  if (track !== undefined) {
    if (!hasNewerFinishedPlay && !track?.isPlaying && track?.playedAt !== undefined) {
      lastSyncCheckedAtMs = nowMs;
      return false;
    }
    if (
      !hasNewerFinishedPlay &&
      lastSyncCheckedAtMs > 0 &&
      nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS
    ) {
      return false;
    }
  } else if (
    lastSyncCheckedAtMs > 0 &&
    nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS
  ) {
    return false;
  }

  syncInFlight = true;
  lastSyncCheckedAtMs = nowMs;
  try {
    const result = await syncSpotifyHistoryWithLogging({
      context: 'cron',
      failureLogLevel: 'warn',
      knownLatestPlayedAt,
    });
    const refreshAlbums =
      (result.status === 'ok' && result.inserted > 0) || (await shouldRefreshFavoriteAlbums(nowMs));
    const favoriteAlbums = refreshAlbums
      ? await refreshFavoriteAlbumsSnapshotWithLogging({
          storedAlbums: await getFavoriteAlbums().catch(() => null),
        })
      : null;

    if (favoriteAlbums?.changed) {
      revalidateTag(CACHE_TAGS.favoriteAlbums, 'max');
      revalidateTag(CACHE_TAGS.musicStats, 'max');
    }
    if (result.status === 'ok' && (result.inserted > 0 || result.total > 0)) {
      if (!Number.isNaN(trackPlayedAtMs)) {
        lastKnownLatestPlayedAtMs = Math.max(lastKnownLatestPlayedAtMs, trackPlayedAtMs);
      }
      revalidateTag(CACHE_TAGS.musicHistory, 'max');
      revalidateTag(CACHE_TAGS.musicStats, 'max');
      revalidateTag(CACHE_TAGS.latestSong, 'max');
    }
    return true;
  } finally {
    syncInFlight = false;
  }
}

export function scheduleSpotifySyncIfStale(track?: Track | null, nowMs = Date.now()): void {
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return;
  }
  if (syncInFlight || track === null) {
    return;
  }
  if (track !== undefined) {
    const currentKey = `${track.id}:${track.playedAt ?? ''}:${track.isPlaying ? '1' : '0'}`;
    if (!track.isPlaying && track.playedAt !== undefined) {
      if (lastObservedTrackKey === currentKey) {
        return;
      }
      if (lastKnownLatestPlayedAtMs > 0) {
        const playedAtMs = new Date(track.playedAt).getTime();
        if (
          !Number.isNaN(playedAtMs) &&
          playedAtMs - lastKnownLatestPlayedAtMs <= PLAYED_AT_SKEW_TOLERANCE_MS
        ) {
          lastObservedTrackKey = currentKey;
          return;
        }
      }
    } else if (
      lastSyncCheckedAtMs > 0 &&
      nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS
    ) {
      return;
    }
    lastObservedTrackKey = currentKey;
  } else if (
    lastSyncCheckedAtMs > 0 &&
    nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS
  ) {
    return;
  }
  try {
    after(async () => {
      await syncSpotifyIfStale(nowMs, track);
    });
  } catch {
    return;
  }
}
