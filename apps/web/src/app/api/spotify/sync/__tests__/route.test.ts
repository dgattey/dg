import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { NextRequest } from 'next/server';

// Mock all the service functions before importing the route
jest.mock('@dg/services/spotify/spotifyClient', () => ({
  getSpotifyClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

// Get typed references to the mocked functions
import * as spotifyClient from '@dg/services/spotify/spotifyClient';
import { revalidateTag } from 'next/cache';
import { handleSpotifySync } from '../route';

const mockSpotifyGet = jest.fn();
const mockGetSpotifyClient = jest.mocked(spotifyClient.getSpotifyClient);
const mockRevalidateTag = jest.mocked(revalidateTag);

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

  it('skips syncing when history is not seeded', async () => {
    const response = await handleSpotifySync(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      gapDetected: false,
      inserted: 0,
      skipped: true,
      success: true,
      total: 0,
    });
    expect(mockSpotifyGet).not.toHaveBeenCalled();
  });

  it('syncs when history is seeded', async () => {
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
    expect(response.body.skipped).toBe(false);
    expect(response.body.gapDetected).toBe(false);
    expect(response.body.success).toBe(true);
    const rowCount = await db.SpotifyPlay.count();
    expect(rowCount).toBe(2);

    // Verify revalidateTag was called when tracks were inserted
    expect(mockRevalidateTag).toHaveBeenCalledWith('spotify-history', 'max');
  });
});
