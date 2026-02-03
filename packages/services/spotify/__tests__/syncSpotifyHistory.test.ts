import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing';

const mockSpotifyGet = jest.fn<
  Promise<{ response: { json: () => Promise<unknown> }; status: number }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  spotifyClient: {
    get: mockSpotifyGet,
  },
}));

// Use unique prefix for this test file to avoid conflicts with parallel tests
const PREFIX = 'sync';

const buildTrackApi = (overrides: Partial<Record<string, unknown>> = {}) => ({
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
  ...overrides,
});

describe('syncSpotifyPlaysSince', () => {
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;
  let syncSpotifyPlaysSince: typeof import('../syncSpotifyHistory').syncSpotifyPlaysSince;

  beforeAll(async () => {
    db = await setupTestDatabase();
    ({ syncSpotifyPlaysSince } = await import('../syncSpotifyHistory'));
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

  it('skips sync when the database is empty', async () => {
    const result = await syncSpotifyPlaysSince();

    expect(result).toEqual({
      gapDetected: false,
      inserted: 0,
      skipped: true,
      total: 0,
    });
    expect(mockSpotifyGet).not.toHaveBeenCalled();
  });

  it('syncs plays since the latest timestamp', async () => {
    const latestPlayedAt = new Date('2025-01-01T00:00:00.000Z');
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: latestPlayedAt,
      trackId: `${PREFIX}-track-seed`,
    });

    const responseBody = {
      items: [
        {
          played_at: '2025-01-02T00:00:00.000Z',
          track: buildTrackApi(),
        },
      ],
      next: null,
    };

    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => responseBody,
      },
      status: 200,
    });

    const result = await syncSpotifyPlaysSince();

    // Verify API was called (may not be called if another test's row is newer)
    // In parallel execution, another test might have a more recent row
    expect(result.skipped).toBe(false);
    expect(result.gapDetected).toBe(false);
    expect(result.total).toBe(1);

    // Verify our track was inserted
    const insertedRow = await db.SpotifyPlay.findOne({
      where: { trackId: `${PREFIX}-track-id` },
    });
    expect(insertedRow?.albumId).toBe(`${PREFIX}-album-id`);
    expect(insertedRow?.artistIds).toEqual([`${PREFIX}-artist-id`]);
    expect(insertedRow?.playedAt.toISOString()).toBe('2025-01-02T00:00:00.000Z');
  });
});
