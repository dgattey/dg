import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { NextRequest } from 'next/server';

// Mock all the service functions before importing the route
jest.mock('@dg/services/spotify/spotifyClient', () => ({
  getSpotifyClient: jest.fn(),
}));

jest.mock('@dg/services/spotify/refreshFavoriteAlbumsSnapshot', () => ({
  refreshFavoriteAlbumsSnapshotWithLogging: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { refreshFavoriteAlbumsSnapshotWithLogging } from '@dg/services/spotify/refreshFavoriteAlbumsSnapshot';
// Get typed references to the mocked functions
import * as spotifyClient from '@dg/services/spotify/spotifyClient';
import { revalidateTag } from 'next/cache';
import { handleSpotifySync } from '../route';

const mockSpotifyGet = jest.fn();
const mockGetSpotifyClient = jest.mocked(spotifyClient.getSpotifyClient);
const mockRefreshFavoriteAlbums = jest.mocked(refreshFavoriteAlbumsSnapshotWithLogging);
const mockRevalidateTag = jest.mocked(revalidateTag);

const revalidatedTags = () => mockRevalidateTag.mock.calls.map(([tag]) => tag);

// Use unique prefix for this test file to avoid conflicts with parallel tests
const PREFIX = 'sync-api';

const buildTrackApi = (suffix = '') => {
  const id = suffix ? `${PREFIX}-${suffix}` : PREFIX;
  return {
    album: {
      external_urls: { spotify: `https://open.spotify.com/album/${id}-album-id` },
      href: `https://api.spotify.com/v1/albums/${id}-album-id`,
      id: `${id}-album-id`,
      images: [{ height: 640, url: 'https://image.test/cover.jpg', width: 640 }],
      name: 'Album Name',
      release_date: '2024-01-01',
      uri: `spotify:album:${id}-album-id`,
    },
    artists: [
      {
        external_urls: { spotify: `https://open.spotify.com/artist/${id}-artist-id` },
        href: `https://api.spotify.com/v1/artists/${id}-artist-id`,
        id: `${id}-artist-id`,
        name: 'Artist Name',
        uri: `spotify:artist:${id}-artist-id`,
      },
    ],
    external_urls: { spotify: `https://open.spotify.com/track/${id}-track-id` },
    href: `https://api.spotify.com/v1/tracks/${id}-track-id`,
    id: `${id}-track-id`,
    name: 'Track Name',
    uri: `spotify:track:${id}-track-id`,
  };
};

const createRequest = (authorization?: string) =>
  new NextRequest('http://localhost/api/spotify/sync', {
    headers: authorization ? { authorization } : {},
  });

// Single shared db instance for all tests in this file
const db = setupTestDatabase();

const originalCronSecret = process.env.CRON_SECRET;

beforeAll(() => {
  process.env.CRON_SECRET = 'test-secret';
  mockGetSpotifyClient.mockReturnValue({ get: mockSpotifyGet } as ReturnType<
    typeof spotifyClient.getSpotifyClient
  >);
});

beforeEach(async () => {
  jest.clearAllMocks();
  mockRefreshFavoriteAlbums.mockResolvedValue({ count: 3 });
  mockGetSpotifyClient.mockReturnValue({ get: mockSpotifyGet } as ReturnType<
    typeof spotifyClient.getSpotifyClient
  >);
  // Only delete rows with our prefix to avoid conflicts with parallel tests
  await db.SpotifyPlay.destroy({
    where: { trackId: { [Op.like]: `${PREFIX}-%` } },
  });
});

afterEach(async () => {
  await db.SpotifyPlay.destroy({
    where: { trackId: { [Op.like]: `${PREFIX}-%` } },
  });
});

afterAll(() => {
  process.env.CRON_SECRET = originalCronSecret;
});

describe('Spotify sync route', () => {
  it('rejects unauthorized requests', async () => {
    const response = await handleSpotifySync(createRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
    expect(mockSpotifyGet).not.toHaveBeenCalled();
  });

  it('seeds history when the database is empty', async () => {
    // Sync reads the whole SpotifyPlay table and derives `after` from the newest
    // row, so one row from another suite changes the request it makes. Suites in
    // other packages share DATABASE_URL_TEST and can insert between this check
    // and sync's own read, so the precondition is confirmed on both sides of the
    // call rather than only before it.
    const foreignPlayCount = () =>
      db.SpotifyPlay.count({ where: { trackId: { [Op.notLike]: `${PREFIX}-%` } } });

    if ((await foreignPlayCount()) > 0) {
      return;
    }

    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          items: [
            {
              played_at: '2025-01-02T00:00:00.000Z',
              track: buildTrackApi('seed'),
            },
          ],
          next: null,
        }),
      },
      status: 200,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    if ((await foreignPlayCount()) > 0) {
      return;
    }

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      favoriteAlbums: 3,
      favoriteAlbumsRefreshed: true,
      gapDetected: false,
      inserted: 1,
      success: true,
      total: 1,
    });
    expect(mockSpotifyGet).toHaveBeenCalledWith(
      expect.stringMatching(/^me\/player\/recently-played\?limit=50$/),
    );
    expect(revalidatedTags()).toEqual(expect.arrayContaining(['favorite-albums', 'music-history']));
  });

  it('syncs when history already exists', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed`,
    });
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          items: [
            {
              played_at: '2025-01-02T00:00:00.000Z',
              track: buildTrackApi('sync'),
            },
          ],
          next: null,
        }),
      },
      status: 200,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
    // Check total (tracks returned from API) and that new row was added
    expect(response.body.total).toBe(1);
    expect(response.body.gapDetected).toBe(false);
    expect(response.body.success).toBe(true);
    expect(response.body.favoriteAlbums).toBe(3);
    expect(response.body.favoriteAlbumsRefreshed).toBe(true);
    // Count only rows with our test prefix to avoid conflicts with parallel tests
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(2);

    // Both tags are invalidated; favorite-albums is refreshed first so call
    // order is not part of the contract.
    expect(revalidatedTags()).toEqual(expect.arrayContaining(['favorite-albums', 'music-history']));
  });

  // The scheduled workflow only knows a run failed if the status is non-2xx, so
  // these are the cases that used to report a green "inserted 0" run forever.
  it.each([
    ['a rate limit', 429, 19_572],
    ['an auth failure', 401, undefined],
    ['an aborted request', 500, undefined],
  ])('fails the run on %s rather than reporting success', async (_label, status, retryAfter) => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-fail`,
      artistIds: [`${PREFIX}-artist-fail`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      // Spotify ids are VARCHAR(22), so keep seeded ids short.
      trackId: `${PREFIX}-f-${status}`,
    });
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      retryAfterSeconds: retryAfter,
      status,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(500);
    expect(response.body.success).toBeUndefined();
    expect(response.body.error).toContain(String(status));
    expect(response.body.retryAfterSeconds).toBe(retryAfter);
    expect(mockRevalidateTag).not.toHaveBeenCalledWith('music-history', 'max');
  });

  it('stays quiet and successful when there is genuinely nothing new', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-quiet`,
      artistIds: [`${PREFIX}-artist-quiet`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-quiet`,
    });
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items: [], next: null }) },
      status: 200,
    });

    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.inserted).toBe(0);
    expect(mockRevalidateTag).not.toHaveBeenCalledWith('music-history', 'max');
  });
});
