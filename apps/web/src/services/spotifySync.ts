import 'server-only';

import { readFavoriteAlbumsRefreshedAt } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { after } from 'next/server';

export const STALE_SPOTIFY_SYNC_INTERVAL_MS = 20 * 60 * 1000;

let lastSyncCheckedAtMs = 0;
let syncInFlight = false;

export function resetSpotifySyncStateForTests(): void {
  lastSyncCheckedAtMs = 0;
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
    }
    lastSyncCheckedAtMs = Date.now();
    return true;
  } finally {
    syncInFlight = false;
  }
}

/**
 * Schedules a non-blocking background Spotify history + favorite-albums sync
 * via Next.js `after()` when the last sync check was more than 20 minutes ago.
 */
export function scheduleSpotifySyncIfStale(): void {
  if (process.env.NODE_ENV !== 'test' && !process.env.SPOTIFY_CLIENT_ID) {
    return;
  }
  const nowMs = Date.now();
  if (
    syncInFlight ||
    (lastSyncCheckedAtMs > 0 && nowMs - lastSyncCheckedAtMs < STALE_SPOTIFY_SYNC_INTERVAL_MS)
  ) {
    return;
  }
  try {
    after(async () => {
      await syncSpotifyIfStale();
    });
  } catch {
    return;
  }
}
