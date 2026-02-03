import { TextDecoder, TextEncoder } from 'node:util';
import { Op, setupTestDatabase } from '@dg/services/testing/setupTestDatabase';
import type { NextRequest } from 'next/server';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;
globalThis.Headers ??= class Headers {} as unknown as typeof Headers;
globalThis.Request ??= class Request {} as unknown as typeof Request;
globalThis.Response ??= class Response {
  static json(body: unknown, init?: { status?: number }) {
    return new Response(body, init?.status);
  }

  constructor(
    private payload: unknown,
    public status = 200,
  ) {}

  json() {
    return Promise.resolve(this.payload);
  }
} as unknown as typeof Response;

const mockSpotifyGet = jest.fn();
const mockRevalidateTag = jest.fn();

jest.mock('@dg/services/spotify/spotifyClient', () => ({
  spotifyClient: {
    get: mockSpotifyGet,
  },
}));

jest.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}));

// Use unique prefix for this test file to avoid conflicts with parallel tests
const PREFIX = 'cron';

const buildTrackApi = () => ({
  album: {
    external_urls: { spotify: `https://open.spotify.com/album/${PREFIX}-album-id` },
    href: `https://api.spotify.com/v1/albums/${PREFIX}-album-id`,
    id: `${PREFIX}-album-id`,
    images: [{ height: 640, url: 'https://image.test/cover.jpg', width: 640 }],
    name: 'Album Name',
    release_date: '2024-01-01',
    uri: `spotify:album:${PREFIX}-album-id`,
  },
  artists: [
    {
      external_urls: { spotify: `https://open.spotify.com/artist/${PREFIX}-artist-id` },
      href: `https://api.spotify.com/v1/artists/${PREFIX}-artist-id`,
      id: `${PREFIX}-artist-id`,
      name: 'Artist Name',
      uri: `spotify:artist:${PREFIX}-artist-id`,
    },
  ],
  external_urls: { spotify: `https://open.spotify.com/track/${PREFIX}-track-id` },
  href: `https://api.spotify.com/v1/tracks/${PREFIX}-track-id`,
  id: `${PREFIX}-track-id`,
  name: 'Track Name',
  uri: `spotify:track:${PREFIX}-track-id`,
});

const createRequest = (authorization?: string) =>
  ({
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'authorization' ? (authorization ?? null) : null,
      has: (name: string) => name.toLowerCase() === 'authorization' && Boolean(authorization),
    },
  }) as NextRequest;

describe('Spotify history cron route', () => {
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;
  let handleSpotifyHistoryCron: typeof import('../route').handleSpotifyHistoryCron;
  const originalCronSecret = process.env.CRON_SECRET;

  beforeAll(async () => {
    // Set CRON_SECRET before importing the route module
    process.env.CRON_SECRET = 'test-secret';
    db = await setupTestDatabase();
    ({ handleSpotifyHistoryCron } = await import('../route'));
  });

  beforeEach(async () => {
    jest.clearAllMocks();
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

  it('rejects unauthorized requests', async () => {
    const response = await handleSpotifyHistoryCron(createRequest());

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
    expect(mockSpotifyGet).not.toHaveBeenCalled();
  });

  it('skips syncing when history is not seeded', async () => {
    const response = await handleSpotifyHistoryCron(createRequest('Bearer test-secret'));

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
              track: buildTrackApi(),
            },
          ],
          next: null,
        }),
      },
      status: 200,
    });

    const response = await handleSpotifyHistoryCron(createRequest('Bearer test-secret'));

    expect(response.status).toBe(200);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
    // Check total (tracks returned from API) and that new row was added
    expect(response.body.total).toBe(1);
    expect(response.body.skipped).toBe(false);
    expect(response.body.gapDetected).toBe(false);
    expect(response.body.success).toBe(true);
    const rowCount = await db.SpotifyPlay.count();
    expect(rowCount).toBe(2);
  });
});
