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
const PREFIX = 'import';

const buildSearchResponse = (artistName = 'Artist Name') => ({
  tracks: {
    items: [
      {
        album: { id: `${PREFIX}-album-id` },
        artists: [{ id: `${PREFIX}-artist-id`, name: artistName }],
        id: `${PREFIX}-track-id`,
        name: 'Track Name',
      },
    ],
  },
});

describe('importSpotifyHistory', () => {
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;
  let importSpotifyHistory: typeof import('../importSpotifyHistory').importSpotifyHistory;

  beforeAll(async () => {
    db = await setupTestDatabase();
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

  it('performs a dry run without touching the database', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => buildSearchResponse('Artist Name'),
      },
      status: 200,
    });

    const result = await importSpotifyHistory(
      [
        {
          artistName: 'Artist Name',
          endTime: '2020-12-17 14:28',
          msPlayed: 161297,
          trackName: 'Track Name',
        },
      ],
      { dryRun: true },
    );

    expect(result).toEqual({
      errors: 0,
      imported: 1,
      notFound: 0,
    });
    // Dry run should not create any rows with our prefix
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(0);
  });

  it('counts not found tracks when search returns no results', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({ tracks: { items: [] } }),
      },
      status: 200,
    });

    const result = await importSpotifyHistory([
      {
        artistName: 'Missing Artist',
        endTime: '2020-12-17 14:28',
        msPlayed: 161297,
        trackName: 'Missing Track',
      },
    ]);

    expect(result).toEqual({
      errors: 0,
      imported: 0,
      notFound: 1,
    });
    // Not found should not create any rows
    const rowCount = await db.SpotifyPlay.count({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    expect(rowCount).toBe(0);
  });

  it('imports rows when not in dry run mode', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => buildSearchResponse('Artist Name Two'),
      },
      status: 200,
    });
    const result = await importSpotifyHistory([
      {
        artistName: 'Artist Name Two',
        endTime: '2020-12-17 14:28',
        msPlayed: 161297,
        trackName: 'Track Name Two',
      },
    ]);

    const createdRows = await db.SpotifyPlay.findAll();
    expect(createdRows).toHaveLength(1);
    expect(createdRows[0]?.albumId).toBe(`${PREFIX}-album-id`);
    expect(createdRows[0]?.artistIds).toEqual([`${PREFIX}-artist-id`]);
    expect(createdRows[0]?.trackId).toBe(`${PREFIX}-track-id`);
    expect(createdRows[0]?.playedAt.toISOString()).toBe('2020-12-17T14:28:00.000Z');

    expect(result).toEqual({
      errors: 0,
      imported: 1,
      notFound: 0,
    });
  });
});
