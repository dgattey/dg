import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import {
  SpotifyHistoryUnavailableError,
  syncSpotifyHistoryWithLogging,
  syncSpotifyPlaysSince,
} from '../syncSpotifyHistory';

const mockSpotifyGet = jest.fn<
  Promise<{
    response: { json: () => Promise<unknown> };
    retryAfterSeconds?: number;
    status: number;
  }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

const PREFIX = 'sync';

const buildTrackApi = (overrides: Partial<Record<string, unknown>> = {}) => ({
  album: {
    external_urls: {
      spotify: `https://open.spotify.com/album/${PREFIX}-album-id`,
    },
    href: `https://api.spotify.com/v1/albums/${PREFIX}-album-id`,
    id: `${PREFIX}-album-id`,
    images: [{ height: 640, url: 'https://image.test/cover.jpg', width: 640 }],
    name: 'Album Name',
    release_date: '2024-01-01',
    uri: `spotify:album:${PREFIX}-album-id`,
  },
  artists: [
    {
      external_urls: {
        spotify: `https://open.spotify.com/artist/${PREFIX}-artist-id`,
      },
      href: `https://api.spotify.com/v1/artists/${PREFIX}-artist-id`,
      id: `${PREFIX}-artist-id`,
      name: 'Artist Name',
      uri: `spotify:artist:${PREFIX}-artist-id`,
    },
  ],
  external_urls: {
    spotify: `https://open.spotify.com/track/${PREFIX}-track-id`,
  },
  href: `https://api.spotify.com/v1/tracks/${PREFIX}-track-id`,
  id: `${PREFIX}-track-id`,
  name: 'Track Name',
  uri: `spotify:track:${PREFIX}-track-id`,
  ...overrides,
});

const db = setupTestDatabase();

beforeEach(async () => {
  jest.clearAllMocks();
  await db.SpotifyPlay.destroy({ where: {} });
});

describe('syncSpotifyPlaysSince', () => {
  it('seeds an empty database from recent plays', async () => {
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

    expect(result).toEqual({
      gapDetected: false,
      inserted: 1,
      total: 1,
    });
    expect(mockSpotifyGet).toHaveBeenCalledWith(
      expect.stringMatching(/^me\/player\/recently-played\?limit=50$/),
    );

    const insertedRow = await db.SpotifyPlay.findOne({
      where: { trackId: `${PREFIX}-track-id` },
    });
    expect(insertedRow?.albumId).toBe(`${PREFIX}-album-id`);
    expect(insertedRow?.playedAt.toISOString()).toBe('2025-01-02T00:00:00.000Z');
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

    expect(result.gapDetected).toBe(false);
    expect(result.total).toBe(1);

    const insertedRow = await db.SpotifyPlay.findOne({
      where: { trackId: `${PREFIX}-track-id` },
    });
    expect(insertedRow?.albumId).toBe(`${PREFIX}-album-id`);
    expect(insertedRow?.artistIds).toEqual([`${PREFIX}-artist-id`]);
    expect(insertedRow?.playedAt.toISOString()).toBe('2025-01-02T00:00:00.000Z');
  });

  it('returns gapDetected when 50 tracks are returned (max limit)', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed-gap`,
    });

    const items = Array.from({ length: 50 }, (_, i) => ({
      played_at: new Date(Date.now() + i * 1000).toISOString(),
      track: buildTrackApi({
        id: `${PREFIX}-track-gap-${i}`,
        uri: `spotify:track:${PREFIX}-track-gap-${i}`,
      }),
    }));

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items, next: null }) },
      status: 200,
    });

    const result = await syncSpotifyPlaysSince();

    expect(result.gapDetected).toBe(true);
    expect(result.total).toBe(50);
  });

  it('returns empty result when no new plays are found', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed-empty`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items: [], next: null }) },
      status: 200,
    });

    const result = await syncSpotifyPlaysSince();

    expect(result).toEqual({
      gapDetected: false,
      inserted: 0,
      total: 0,
    });
  });

  it('skips querying the database when knownLatestPlayedAt is provided and Spotify has no new plays', async () => {
    const knownLatestPlayedAt = new Date('2026-10-23T08:57:42.890Z');
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items: [], next: null }) },
      status: 200,
    });

    const findOneSpy = jest.spyOn(db.SpotifyPlay, 'findOne');
    try {
      const result = await syncSpotifyPlaysSince({ knownLatestPlayedAt });

      expect(result).toEqual({
        gapDetected: false,
        inserted: 0,
        total: 0,
      });
      expect(mockSpotifyGet).toHaveBeenCalledWith(
        `me/player/recently-played?limit=50&after=${knownLatestPlayedAt.getTime()}`,
      );
      expect(findOneSpy).not.toHaveBeenCalled();
    } finally {
      findOneSpy.mockRestore();
    }
  });

  it('throws instead of reporting an empty sync when the API fails', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed-fail`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      status: 500,
    });

    await expect(syncSpotifyPlaysSince()).rejects.toThrow(SpotifyHistoryUnavailableError);
  });

  it('surfaces a rate limit with its Retry-After rather than looking idle', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed-429`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      retryAfterSeconds: 19_572,
      status: 429,
    });

    await expect(syncSpotifyPlaysSince()).rejects.toMatchObject({
      name: 'SpotifyHistoryUnavailableError',
      retryAfterSeconds: 19_572,
      status: 429,
    });
  });

  it('throws when Spotify returns plays that cannot be mapped', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-seed`,
      artistIds: [`${PREFIX}-artist-seed`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-seed-shape`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          items: [
            {
              played_at: '2025-01-02T00:00:00.000Z',
              track: buildTrackApi({
                album: { ...buildTrackApi().album, images: [] },
              }),
            },
          ],
          next: null,
        }),
      },
      status: 200,
    });

    await expect(syncSpotifyPlaysSince()).rejects.toThrow(/none could be mapped/);
  });

  it('inserts multiple plays of the same track at different timestamps', async () => {
    const now = new Date();
    const seedPlayedAt = new Date(now.getTime() - 60000);

    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-id`,
      artistIds: [`${PREFIX}-artist-id`],
      playedAt: seedPlayedAt,
      trackId: `${PREFIX}-track-id`,
    });

    const newPlayedAt = new Date(now.getTime() + 60000);
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          items: [
            {
              played_at: newPlayedAt.toISOString(),
              track: buildTrackApi(),
            },
          ],
          next: null,
        }),
      },
      status: 200,
    });

    const result = await syncSpotifyPlaysSince();

    expect(result.total).toBe(1);
    expect(result.inserted).toBe(1);

    const rows = await db.SpotifyPlay.findAll({
      where: { trackId: `${PREFIX}-track-id` },
    });
    expect(rows).toHaveLength(2);
  });
});

describe('syncSpotifyHistoryWithLogging', () => {
  it('returns result when seeding an empty database', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items: [], next: null }) },
      status: 200,
    });

    const result = await syncSpotifyHistoryWithLogging({ context: 'backfill' });

    expect(result).toEqual({
      gapDetected: false,
      inserted: 0,
      status: 'ok',
      total: 0,
    });
    expect(mockSpotifyGet).toHaveBeenCalled();
  });

  it('returns result on successful sync', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-log`,
      artistIds: [`${PREFIX}-artist-log`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-log`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({ items: [], next: null }) },
      status: 200,
    });

    const result = await syncSpotifyHistoryWithLogging({ context: 'cron' });

    expect(result.status).toBe('ok');
  });

  it('reports a failure with its reason instead of a zeroed success', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-err`,
      artistIds: [`${PREFIX}-artist-err`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-err`,
    });

    mockSpotifyGet.mockRejectedValue(new Error('Network failure'));

    const result = await syncSpotifyHistoryWithLogging({ context: 'cron' });

    expect(result).toEqual({
      reason: 'Network failure',
      retryAfterSeconds: undefined,
      status: 'failed',
    });
  });

  it('carries Retry-After through to the caller on a rate limit', async () => {
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-429`,
      artistIds: [`${PREFIX}-artist-429`],
      playedAt: new Date('2025-01-01T00:00:00.000Z'),
      trackId: `${PREFIX}-track-429`,
    });

    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      retryAfterSeconds: 19_572,
      status: 429,
    });

    const result = await syncSpotifyHistoryWithLogging({ context: 'cron' });

    expect(result).toMatchObject({ retryAfterSeconds: 19_572, status: 'failed' });
  });
});
