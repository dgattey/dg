import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';

const mockSpotifyGet = jest.fn<
  Promise<{
    response: { json: () => Promise<unknown>; headers?: { get: (name: string) => string | null } };
    status: number;
  }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

// Use unique prefix for this test file to avoid conflicts with parallel tests
const PREFIX = 'import';

/**
 * Builds a batch tracks response for GET /tracks?ids=
 */
const buildBatchTracksResponse = (
  tracks: Array<{ trackId: string; albumId: string; artistIds: Array<string> } | null>,
) => ({
  tracks: tracks.map((t) =>
    t
      ? {
          album: { id: t.albumId },
          artists: t.artistIds.map((id) => ({ id })),
          id: t.trackId,
          uri: `spotify:track:${t.trackId}`,
        }
      : null,
  ),
});

/**
 * Creates extended format JSON text for testing
 */
const createExtendedJson = (
  entries: Array<{ ts: string; trackUri: string | null; msPlayed?: number }>,
) =>
  JSON.stringify(
    entries.map((e) => ({
      ms_played: e.msPlayed ?? 180000,
      spotify_track_uri: e.trackUri,
      ts: e.ts,
    })),
  );

describe('importSpotifyHistory', () => {
  const db = setupTestDatabase();
  let importSpotifyHistory: typeof import('../importSpotifyHistory').importSpotifyHistory;

  beforeAll(async () => {
    ({ importSpotifyHistory } = await import('../importSpotifyHistory'));
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

  it('parses extended format and imports rows', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildBatchTracksResponse([
            {
              albumId: `${PREFIX}-album-1`,
              artistIds: [`${PREFIX}-artist-1`],
              trackId: `${PREFIX}-track-1`,
            },
          ]),
      },
      status: 200,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-1`, ts: '2021-11-23T18:54:38Z' },
    ]);

    const result = await importSpotifyHistory(fileText);

    expect(result).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 1,
      skipped: 0,
    });

    const rows = await db.SpotifyPlay.findAll({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.trackId).toBe(`${PREFIX}-track-1`);
    expect(rows[0]?.albumId).toBe(`${PREFIX}-album-1`);
    expect(rows[0]?.artistIds).toEqual([`${PREFIX}-artist-1`]);
    expect(rows[0]?.playedAt.toISOString()).toBe('2021-11-23T18:54:38.000Z');
  });

  it('performs a dry run without calling API or touching database', async () => {
    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-dry`, ts: '2021-11-23T18:54:38Z' },
      { trackUri: null, ts: '2021-11-23T19:00:00Z' }, // Podcast - should be skipped
    ]);

    const result = await importSpotifyHistory(fileText, { dryRun: true });

    // Dry run should NOT call the Spotify API
    expect(mockSpotifyGet).not.toHaveBeenCalled();

    expect(result).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 1, // Music entries count
      skipped: 1, // Non-music entries count
    });

    // Dry run should not create any rows
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(0);
  });

  it('filters out video/podcast entries with null spotify_track_uri', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildBatchTracksResponse([
            {
              albumId: `${PREFIX}-album-music`,
              artistIds: [`${PREFIX}-artist-music`],
              trackId: `${PREFIX}-track-music`,
            },
          ]),
      },
      status: 200,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-music`, ts: '2021-11-23T18:54:38Z' },
      { trackUri: null, ts: '2021-11-23T19:00:00Z' }, // Podcast/video
      { trackUri: null, ts: '2021-11-23T19:05:00Z' }, // Another podcast
    ]);

    const result = await importSpotifyHistory(fileText);

    expect(result).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 1,
      skipped: 2, // Two null URIs
    });

    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(1);
  });

  it('handles duplicate re-import with imported: 0', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () =>
          buildBatchTracksResponse([
            {
              albumId: `${PREFIX}-album-dup`,
              artistIds: [`${PREFIX}-artist-dup`],
              trackId: `${PREFIX}-track-dup`,
            },
          ]),
      },
      status: 200,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-dup`, ts: '2021-11-23T18:54:38Z' },
    ]);

    // First import
    const result1 = await importSpotifyHistory(fileText);
    expect(result1.imported).toBe(1);

    // Second import of the same data
    const result2 = await importSpotifyHistory(fileText);
    expect(result2).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 0, // Already exists
      skipped: 0,
    });

    // Should still only have one row
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(1);
  });

  it('handles batch fetch failures with 500 response', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({}),
      },
      status: 500,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-fail`, ts: '2021-11-23T18:54:38Z' },
    ]);

    const result = await importSpotifyHistory(fileText);

    // Track not found due to API failure counts as error, not skipped
    expect(result.errors).toBe(1);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failedTrackIds).toEqual([`${PREFIX}-track-fail`]);

    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(0);
  });

  it('retries on 429 rate limit', async () => {
    let callCount = 0;
    mockSpotifyGet.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call returns 429
        return Promise.resolve({
          response: {
            json: async () => ({}),
          },
          status: 429,
        });
      }
      // Second call succeeds
      return Promise.resolve({
        response: {
          json: async () =>
            buildBatchTracksResponse([
              {
                albumId: `${PREFIX}-album-retry`,
                artistIds: [`${PREFIX}-artist-retry`],
                trackId: `${PREFIX}-track-retry`,
              },
            ]),
        },
        status: 200,
      });
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-retry`, ts: '2021-11-23T18:54:38Z' },
    ]);

    const result = await importSpotifyHistory(fileText);

    expect(callCount).toBe(2); // Initial + retry
    expect(result).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 1,
      skipped: 0,
    });
  }, 10000); // Longer timeout since 429 retry waits 5 seconds

  it('skips API fetch for tracks already in DB', async () => {
    // Pre-populate the DB with a track
    await db.SpotifyPlay.create({
      albumId: `${PREFIX}-album-existing`,
      artistIds: [`${PREFIX}-artist-existing`],
      playedAt: new Date('2021-01-01T00:00:00Z'),
      trackId: `${PREFIX}-track-existing`,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${PREFIX}-track-existing`, ts: '2021-11-23T18:54:38Z' },
    ]);

    const result = await importSpotifyHistory(fileText);

    // Should not have called the API since track exists in DB
    expect(mockSpotifyGet).not.toHaveBeenCalled();

    expect(result).toEqual({
      errors: 0,
      failedTrackIds: [],
      imported: 1,
      skipped: 0,
    });

    // Should have two rows now (original + new play)
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(2);
  });

  it('validates input with Valibot and throws on malformed JSON', async () => {
    await expect(importSpotifyHistory('not valid json')).rejects.toThrow();
  });

  it('validates input with Valibot and throws on wrong schema', async () => {
    // Valid JSON but wrong schema (basic format instead of extended)
    const basicFormatJson = JSON.stringify([
      { artistName: 'Artist', endTime: '2020-12-17 14:28', msPlayed: 180000, trackName: 'Track' },
    ]);

    await expect(importSpotifyHistory(basicFormatJson)).rejects.toThrow();
  });
});
