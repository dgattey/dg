import { NextRequest } from 'next/server';

jest.mock('@dg/services/spotify/syncSpotifyHistory', () => ({
  syncSpotifyHistoryWithLogging: jest.fn(),
}));

jest.mock('@dg/services/spotify/refreshFavoriteAlbumsSnapshot', () => ({
  refreshFavoriteAlbumsSnapshotWithLogging: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
import { syncSpotifyHistoryWithLogging } from '@dg/services/spotify/syncSpotifyHistory';
import { revalidateTag } from 'next/cache';
import { handleSpotifySync } from '../route';

const mockSyncHistory = jest.mocked(syncSpotifyHistoryWithLogging);
const mockRefreshFavoriteAlbums = jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging);
const mockRevalidateTag = jest.mocked(revalidateTag);

const createRequest = (authorization?: string) =>
  new NextRequest('http://localhost/api/spotify/sync', {
    headers: authorization ? { authorization } : {},
  });

const originalCronSecret = process.env.CRON_SECRET;

beforeAll(() => {
  process.env.CRON_SECRET = 'test-secret';
});

beforeEach(() => {
  jest.clearAllMocks();
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

  it('stays quiet and successful when there is genuinely nothing new', async () => {
    mockRefreshFavoriteAlbums.mockResolvedValue({ changed: false, count: 3 });
    mockSyncHistory.mockResolvedValue({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.inserted).toBe(0);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });
});
