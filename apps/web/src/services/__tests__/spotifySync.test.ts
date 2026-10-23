jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
  revalidateTag: jest.fn(),
}));

const scheduledCallbacks: Array<() => Promise<void> | void> = [];

jest.mock('next/server', () => ({
  after: jest.fn((cb: () => Promise<void> | void) => {
    scheduledCallbacks.push(cb);
  }),
}));

jest.mock('@dg/services/spotify/refreshFavoriteAlbumsSnapshot', () => ({
  refreshFavoriteAlbumsSnapshotWithLogging: jest.fn(),
}));

jest.mock('@dg/services/spotify/syncSpotifyHistory', () => ({
  getLatestPlayedAt: jest.fn(),
  syncSpotifyHistoryWithLogging: jest.fn(),
}));

jest.mock('../albums', () => ({
  getFavoriteAlbums: jest.fn(async () => []),
}));

jest.mock('../spotify', () => ({
  getLastKnownSong: jest.fn(async () => null),
}));

import type { Track } from '@dg/content-models/spotify/Track';
import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import {
  getLatestPlayedAt,
  syncSpotifyHistoryWithLogging,
} from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import {
  resetSpotifySyncStateForTests,
  STALE_SPOTIFY_SYNC_INTERVAL_MS,
  scheduleSpotifySyncIfStale,
  syncSpotifyIfStale,
} from '../spotifySync';

const PLAYING_TRACK = {
  id: 'track-1',
  isPlaying: true,
  name: 'Active Track',
} as Track;

const SYNCED_IDLE_TRACK = {
  id: 'track-1',
  isPlaying: false,
  name: 'Already Synced Track',
  playedAt: '2026-10-23T08:00:00.000Z',
} as Track;

const UNSYNCED_IDLE_TRACK = {
  id: 'track-2',
  isPlaying: false,
  name: 'Newly Finished Track',
  playedAt: '2026-10-23T08:15:00.000Z',
} as Track;

describe('spotifySync', () => {
  beforeEach(() => {
    scheduledCallbacks.length = 0;
    resetSpotifySyncStateForTests();
    jest.clearAllMocks();
  });

  it('skips syncing on a cold start when playback is stopped and track.playedAt is already in the database', async () => {
    const nowMs = 1_760_000_000_000;
    jest.mocked(getLatestPlayedAt).mockResolvedValue(new Date('2026-10-23T08:00:00.000Z'));

    scheduleSpotifySyncIfStale(SYNCED_IDLE_TRACK, nowMs);
    expect(after).toHaveBeenCalledTimes(1);
    await scheduledCallbacks[0]?.();

    expect(syncSpotifyHistoryWithLogging).not.toHaveBeenCalled();
    expect(refreshFavoriteAlbumsSnapshotWithLogging).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();

    scheduleSpotifySyncIfStale(SYNCED_IDLE_TRACK, nowMs + 30_000);
    expect(after).toHaveBeenCalledTimes(1);
  });

  it('syncs immediately on a cold start when playback is stopped but track.playedAt is newer than the cached database state', async () => {
    const nowMs = 1_760_000_000_000;
    const cachedPlayedAt = new Date('2026-10-23T08:00:00.000Z');
    jest.mocked(getLatestPlayedAt).mockResolvedValue(cachedPlayedAt);
    jest.mocked(syncSpotifyHistoryWithLogging).mockResolvedValueOnce({
      gapDetected: false,
      inserted: 3,
      status: 'ok',
      total: 3,
    });
    jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging).mockResolvedValueOnce({
      changed: true,
      count: 105,
    });

    scheduleSpotifySyncIfStale(UNSYNCED_IDLE_TRACK, nowMs);
    expect(after).toHaveBeenCalledTimes(1);
    await scheduledCallbacks[0]?.();

    expect(syncSpotifyHistoryWithLogging).toHaveBeenCalledWith({
      context: 'cron',
      failureLogLevel: 'warn',
      knownLatestPlayedAt: cachedPlayedAt,
    });
    expect(refreshFavoriteAlbumsSnapshotWithLogging).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith('favorite-albums', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('music-history', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('latest-song', 'max');
  });

  it('does not call revalidateTag when the background sync finds no changes', async () => {
    jest.mocked(getLatestPlayedAt).mockResolvedValue(null);
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

  it('schedules the background check via after() when a track is actively playing and throttles within the 20-minute window', async () => {
    const nowMs = 1_760_000_000_000;
    jest.mocked(getLatestPlayedAt).mockResolvedValue(new Date('2026-10-23T08:00:00.000Z'));
    jest.mocked(syncSpotifyHistoryWithLogging).mockResolvedValue({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });
    jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging).mockResolvedValue({
      changed: false,
      count: 104,
    });

    scheduleSpotifySyncIfStale(PLAYING_TRACK, nowMs);
    expect(after).toHaveBeenCalledTimes(1);
    await scheduledCallbacks[0]?.();
    expect(syncSpotifyHistoryWithLogging).toHaveBeenCalledTimes(1);

    scheduleSpotifySyncIfStale(PLAYING_TRACK, nowMs + 60_000);
    expect(after).toHaveBeenCalledTimes(1);

    scheduleSpotifySyncIfStale(PLAYING_TRACK, nowMs + STALE_SPOTIFY_SYNC_INTERVAL_MS + 1_000);
    expect(after).toHaveBeenCalledTimes(2);
  });
});
