import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { readFavoriteAlbumsRefreshedAt } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { after } from 'next/server';

export const STALE_SPOTIFY_SYNC_INTERVAL_MS = 60 * 60 * 1000;

let lastSyncCheckedAtMs = 0;
let lastObservedTrackKey: string | null = null;
let syncInFlight = false;

export function resetSpotifySyncStateForTests(): void {
  lastSyncCheckedAtMs = 0;
  lastObservedTrackKey = null;
  syncInFlight = false;
}

export async function syncSpotifyIfStale(nowMs = Date.now()): Promise<boolean> {
  if (
    syncInFlight ||
    (lastSyncCheckedAtMs > 0 && nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS)
  ) {
    return false;
  }
  syncInFlight = true;
  lastSyncCheckedAtMs = nowMs;
  try {
    const refreshedAt = await readFavoriteAlbumsRefreshedAt();
    if (refreshedAt && nowMs - refreshedAt.getTime() < STALE_SPOTIFY_SYNC_INTERVAL_MS) {
      lastSyncCheckedAtMs = refreshedAt.getTime();
      return false;
    }

    const result = await syncSpotifyHistoryWithLogging({
      context: 'cron',
      failureLogLevel: 'warn',
    });
    const favoriteAlbums = await refreshFavoriteAlbumsSnapshotWithLogging();

    if (favoriteAlbums?.changed) {
      revalidateTag('favorite-albums', 'max');
    }
    if (result.status === 'ok' && result.inserted > 0) {
      revalidateTag('music-history', 'max');
      revalidateTag('latest-song', 'max');
    }
    lastSyncCheckedAtMs = Date.now();
    return true;
  } finally {
    syncInFlight = false;
  }
}

export function scheduleSpotifySyncIfStale(track?: Track | null, nowMs = Date.now()): void {
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return;
  }
  if (!track) {
    return;
  }
  const currentKey = `${track.id}:${track.playedAt ?? ''}`;
  const trackChanged = lastObservedTrackKey !== null && lastObservedTrackKey !== currentKey;
  lastObservedTrackKey = currentKey;

  if (lastSyncCheckedAtMs === 0 && !track.isPlaying) {
    lastSyncCheckedAtMs = nowMs;
    return;
  }
  if (!track.isPlaying && !trackChanged) {
    return;
  }
  if (
    syncInFlight ||
    (lastSyncCheckedAtMs > 0 && nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS)
  ) {
    return;
  }
  try {
    after(async () => {
      await syncSpotifyIfStale(nowMs);
    });
  } catch {
    return;
  }
}
