import { NextRequest } from 'next/server';

jest.mock('@dg/services/spotify/syncSpotifyHistory', () => ({
  getLatestPlayedAt: jest.fn(),
  syncSpotifyHistoryWithLogging: jest.fn(),
}));

jest.mock('@dg/services/spotify/refreshFavoriteAlbumsSnapshot', () => ({
  refreshFavoriteAlbumsSnapshotWithLogging: jest.fn(),
}));

jest.mock('../../../../../services/albums', () => ({
  getFavoriteAlbums: jest.fn(async () => []),
}));

jest.mock('../../../../../services/spotify', () => ({
  getLastKnownSong: jest.fn(async () => null),
}));

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
  revalidateTag: jest.fn(),
}));

import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import {
  getLatestPlayedAt,
  syncSpotifyHistoryWithLogging,
} from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { resetSpotifySyncStateForTests } from '../../../../../services/spotifySync';
import { handleSpotifySync } from '../route';

const mockGetLatestPlayedAt = jest.mocked(getLatestPlayedAt);
const mockSyncHistory = jest.mocked(syncSpotifyHistoryWithLogging);
const mockRefreshFavoriteAlbums = jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging);
const mockRevalidateTag = jest.mocked(revalidateTag);

const createRequest = (authorization?: string, query = '') =>
  new NextRequest(`http://localhost/api/spotify/sync${query}`, {
    headers: authorization ? { authorization } : {},
  });

const originalCronSecret = process.env.CRON_SECRET;

beforeAll(() => {
  process.env.CRON_SECRET = 'test-secret';
});

beforeEach(() => {
  jest.clearAllMocks();
  resetSpotifySyncStateForTests();
  mockGetLatestPlayedAt.mockResolvedValue(new Date('2026-10-23T08:57:42.890Z'));
  mockRefreshFavoriteAlbums.mockResolvedValue({ changed: true, count: 3 });
});

afterAll(() => {
  process.env.CRON_SECRET = originalCronSecret;
});

describe('Spotify sync route', () => {
  it('rejects unauthorized requests', async () => {
    const response = await handleSpotifySync(createRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
    expect(mockSyncHistory).not.toHaveBeenCalled();
  });

  it('fails closed when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET;
    try {
      const response = await handleSpotifySync(createRequest('Bearer undefined'));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockSyncHistory).not.toHaveBeenCalled();
    } finally {
      process.env.CRON_SECRET = 'test-secret';
    }
  });

  it('revalidates music-history, latest-song, and favorite-albums when new plays and album changes arrive', async () => {
    const knownLatestPlayedAt = new Date('2026-10-23T08:57:42.890Z');
    mockGetLatestPlayedAt.mockResolvedValue(knownLatestPlayedAt);
    mockSyncHistory.mockResolvedValue({
      gapDetected: false,
      inserted: 1,
      status: 'ok',
      total: 1,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      favoriteAlbums: 3,
      favoriteAlbumsRefreshed: true,
      gapDetected: false,
      inserted: 1,
      success: true,
      total: 1,
    });
    expect(mockSyncHistory).toHaveBeenCalledWith({
      context: 'cron',
      failureLogLevel: 'error',
      knownLatestPlayedAt,
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith('music-history', 'max');
    expect(mockRevalidateTag).toHaveBeenCalledWith('latest-song', 'max');
    expect(mockRevalidateTag).toHaveBeenCalledWith('favorite-albums', 'max');
  });

  it.each([
    ['a rate limit', 429, 19_572],
    ['an auth failure', 401, undefined],
    ['an aborted request', 500, undefined],
  ])('fails the run on %s rather than reporting success', async (_label, status, retryAfter) => {
    mockSyncHistory.mockResolvedValue({
      reason: `Spotify recently-played read failed with status ${status}`,
      retryAfterSeconds: retryAfter,
      status: 'failed',
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(500);
    expect(response.body.success).toBeUndefined();
    expect(response.body.error).toContain(String(status));
    expect(response.body.retryAfterSeconds).toBe(retryAfter);
    expect(mockRevalidateTag).not.toHaveBeenCalledWith('music-history', 'max');
    expect(mockRevalidateTag).not.toHaveBeenCalledWith('latest-song', 'max');
  });

  it('stays quiet when nothing new played and skips repeat favorite-albums playlist fetches within the hour unless forced', async () => {
    mockRefreshFavoriteAlbums.mockResolvedValue({ changed: false, count: 3 });
    mockSyncHistory.mockResolvedValue({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });

    const first = await handleSpotifySync(createRequest('Bearer test-secret'));
    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);
    expect(first.body.inserted).toBe(0);
    expect(first.body.favoriteAlbumsRefreshed).toBe(true);
    expect(mockRefreshFavoriteAlbums).toHaveBeenCalledTimes(1);
    expect(mockRevalidateTag).not.toHaveBeenCalled();

    const second = await handleSpotifySync(createRequest('Bearer test-secret'));
    expect(second.status).toBe(200);
    expect(second.body.favoriteAlbumsRefreshed).toBe(false);
    expect(mockRefreshFavoriteAlbums).toHaveBeenCalledTimes(1);

    const forced = await handleSpotifySync(createRequest('Bearer test-secret', '?force=true'));
    expect(forced.status).toBe(200);
    expect(forced.body.favoriteAlbumsRefreshed).toBe(true);
    expect(mockRefreshFavoriteAlbums).toHaveBeenCalledTimes(2);
  });
});
