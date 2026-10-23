jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

const scheduledCallbacks: Array<() => Promise<void> | void> = [];

jest.mock('next/server', () => ({
  after: jest.fn((cb: () => Promise<void> | void) => {
    scheduledCallbacks.push(cb);
  }),
}));

jest.mock('@dg/services/spotify/favoriteAlbumsSnapshot', () => ({
  readFavoriteAlbumsRefreshedAt: jest.fn(),
}));

jest.mock('@dg/services/spotify/refreshFavoriteAlbumsSnapshot', () => ({
  refreshFavoriteAlbumsSnapshotWithLogging: jest.fn(),
}));

jest.mock('@dg/services/spotify/syncSpotifyHistory', () => ({
  syncSpotifyHistoryWithLogging: jest.fn(),
}));

import { readFavoriteAlbumsRefreshedAt } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import {
  resetSpotifySyncStateForTests,
  STALE_SPOTIFY_SYNC_INTERVAL_MS,
  scheduleSpotifySyncIfStale,
  syncSpotifyIfStale,
} from '../spotifySync';

describe('spotifySync', () => {
  beforeEach(() => {
    scheduledCallbacks.length = 0;
    resetSpotifySyncStateForTests();
    jest.clearAllMocks();
  });

  it('skips syncing when FavoriteAlbumSnapshot.refreshedAt is within the 20-minute window', async () => {
    const nowMs = 1_760_000_000_000;
    jest
      .mocked(readFavoriteAlbumsRefreshedAt)
      .mockResolvedValueOnce(new Date(nowMs - 5 * 60 * 1000));

    await expect(syncSpotifyIfStale(nowMs)).resolves.toBe(false);
    expect(syncSpotifyHistoryWithLogging).not.toHaveBeenCalled();
    expect(refreshFavoriteAlbumsSnapshotWithLogging).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();

    // Subsequent check within the remaining window skips the DB query via the in-memory gate
    await expect(syncSpotifyIfStale(nowMs + 60_000)).resolves.toBe(false);
    expect(readFavoriteAlbumsRefreshedAt).toHaveBeenCalledTimes(1);
  });

  it('syncs history and favorite albums when refreshedAt is older than 20 minutes and revalidates changed tags', async () => {
    const nowMs = 1_760_000_000_000;
    jest
      .mocked(readFavoriteAlbumsRefreshedAt)
      .mockResolvedValueOnce(new Date(nowMs - STALE_SPOTIFY_SYNC_INTERVAL_MS - 1_000));
    jest.mocked(syncSpotifyHistoryWithLogging).mockResolvedValueOnce({
      gapDetected: false,
      inserted: 2,
      status: 'ok',
      total: 2,
    });
    jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging).mockResolvedValueOnce({
      changed: true,
      count: 105,
    });

    await expect(syncSpotifyIfStale(nowMs)).resolves.toBe(true);
    expect(syncSpotifyHistoryWithLogging).toHaveBeenCalledWith({
      context: 'cron',
      failureLogLevel: 'warn',
    });
    expect(refreshFavoriteAlbumsSnapshotWithLogging).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith('favorite-albums', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('music-history', 'max');
  });

  it('does not call revalidateTag when the background sync finds no changes', async () => {
    jest.mocked(readFavoriteAlbumsRefreshedAt).mockResolvedValueOnce(null);
    jest.mocked(syncSpotifyHistoryWithLogging).mockResolvedValueOnce({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });
    jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging).mockResolvedValueOnce({
      changed: false,
      count: 104,
    });

    await expect(syncSpotifyIfStale()).resolves.toBe(true);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('schedules the background check via after() without blocking', async () => {
    jest.mocked(readFavoriteAlbumsRefreshedAt).mockResolvedValueOnce(null);
    jest.mocked(syncSpotifyHistoryWithLogging).mockResolvedValueOnce({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });
    jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging).mockResolvedValueOnce({
      changed: false,
      count: 104,
    });

    scheduleSpotifySyncIfStale();
    expect(after).toHaveBeenCalledTimes(1);
    expect(scheduledCallbacks).toHaveLength(1);

    await scheduledCallbacks[0]?.();
    expect(syncSpotifyHistoryWithLogging).toHaveBeenCalledTimes(1);
    expect(refreshFavoriteAlbumsSnapshotWithLogging).toHaveBeenCalledTimes(1);
  });
});
