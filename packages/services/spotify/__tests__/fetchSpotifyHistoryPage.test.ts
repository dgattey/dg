import { Op } from '@dg/db';

const hasTestDb = Boolean(process.env.DATABASE_URL_TEST);
const describeIf = hasTestDb ? describe : describe.skip;

let db: typeof import('@dg/db').db | null = null;
type FetchSpotifyHistoryPage = (options: { before?: Date; pageSize?: number }) => Promise<{
  nextCursor: string | null;
  tracks: Array<{ id: string; playedAt: string }>;
}>;

let fetchSpotifyHistoryPage: FetchSpotifyHistoryPage | null = null;
const getDb = () => {
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db;
};
const getFetchSpotifyHistoryPage = () => {
  if (!fetchSpotifyHistoryPage) {
    throw new Error('fetchSpotifyHistoryPage not initialized');
  }
  return fetchSpotifyHistoryPage;
};

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
const PREFIX = 'fetch';

const buildTrackApi = (id: string) => ({
  album: {
    external_urls: { spotify: `https://open.spotify.com/album/album-${id}` },
    href: `https://api.spotify.com/v1/albums/album-${id}`,
    id: `album-${id}`,
    images: [{ height: 640, url: `https://image.test/${id}.jpg`, width: 640 }],
    name: `Album ${id}`,
    release_date: '2024-01-01',
    uri: `spotify:album:album-${id}`,
  },
  artists: [
    {
      external_urls: { spotify: `https://open.spotify.com/artist/artist-${id}` },
      href: `https://api.spotify.com/v1/artists/artist-${id}`,
      id: `artist-${id}`,
      name: `Artist ${id}`,
      uri: `spotify:artist:artist-${id}`,
    },
  ],
  external_urls: { spotify: `https://open.spotify.com/track/track-${id}` },
  href: `https://api.spotify.com/v1/tracks/track-${id}`,
  id: `track-${id}`,
  name: `Track ${id}`,
  uri: `spotify:track:track-${id}`,
});

describeIf('fetchSpotifyHistoryPage', () => {
  beforeAll(async () => {
    ({ db } = await import('@dg/db'));
    ({ fetchSpotifyHistoryPage } = await import('../fetchSpotifyHistoryPage'));
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    // Only delete rows with our prefix to avoid conflicts with parallel tests
    await getDb().SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  afterEach(async () => {
    await getDb().SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  it('hydrates play rows into tracks with playedAt values', async () => {
    await getDb().SpotifyPlay.bulkCreate([
      {
        albumId: `${PREFIX}-album-1`,
        artistIds: [`${PREFIX}-artist-1`],
        playedAt: new Date('2025-02-01T10:00:00.000Z'),
        trackId: `${PREFIX}-track-1`,
      },
      {
        albumId: `${PREFIX}-album-2`,
        artistIds: [`${PREFIX}-artist-2`],
        playedAt: new Date('2025-02-01T09:00:00.000Z'),
        trackId: `${PREFIX}-track-2`,
      },
    ]);

    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          tracks: [buildTrackApi(`${PREFIX}-1`), buildTrackApi(`${PREFIX}-2`)],
        }),
      },
      status: 200,
    });

    // Query without `before` to get all tracks
    const result = await getFetchSpotifyHistoryPage()({});

    expect(result.tracks).toHaveLength(2);
    // Results are ordered by playedAt DESC, so 10:00 comes first
    expect(result.tracks[0]).toMatchObject({
      id: `track-${PREFIX}-1`,
      playedAt: '2025-02-01T10:00:00.000Z',
    });
    expect(result.tracks[1]).toMatchObject({
      id: `track-${PREFIX}-2`,
      playedAt: '2025-02-01T09:00:00.000Z',
    });
    expect(result.nextCursor).toBeNull();
  });
});
