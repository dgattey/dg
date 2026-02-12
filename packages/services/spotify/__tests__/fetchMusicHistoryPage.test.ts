import { Op } from '@dg/db';

let db: typeof import('@dg/db').db | null = null;
type FetchMusicHistoryPage = (options: { before?: Date; pageSize?: number }) => Promise<{
  nextCursor: string | null;
  tracks: Array<{
    trackId: string;
    trackName: string;
    artistNames: string;
    albumName: string;
    albumImageUrl: string;
    url: string;
    playedAt: string;
  }>;
}>;

let fetchMusicHistoryPage: FetchMusicHistoryPage | null = null;

const getDb = () => {
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db;
};

const getFetchMusicHistoryPage = () => {
  if (!fetchMusicHistoryPage) {
    throw new Error('fetchMusicHistoryPage not initialized');
  }
  return fetchMusicHistoryPage;
};

const mockSpotifyGetWithRetry = jest.fn();

jest.mock('../trackMetadataShared', () => ({
  ...jest.requireActual('../trackMetadataShared'),
  spotifyGetWithRetry: (...args: Array<unknown>) => mockSpotifyGetWithRetry(...args),
}));

// Use unique prefix for this test file to avoid conflicts with parallel tests
// Keep short to stay within 22-char ID limit
const PREFIX = 'mf';

const buildTrackDisplayData = (id: string) => ({
  album: {
    id: `${PREFIX}-album-${id}`,
    imageUrl: `https://image.test/${id}.jpg`,
    name: `Album ${id}`,
    url: `https://open.spotify.com/album/album-${id}`,
  },
  artists: [
    {
      id: `${PREFIX}-artist-${id}`,
      name: `Artist ${id}`,
      position: 0,
      url: `https://open.spotify.com/artist/artist-${id}`,
    },
  ],
  track: {
    albumId: `${PREFIX}-album-${id}`,
    id: `${PREFIX}-track-${id}`,
    name: `Track ${id}`,
    url: `https://open.spotify.com/track/track-${id}`,
  },
});

const buildApiResponse = (id: string) => ({
  album: {
    external_urls: { spotify: `https://open.spotify.com/album/album-${id}` },
    id: `${PREFIX}-album-${id}`,
    images: [{ height: 640, url: `https://image.test/${id}.jpg`, width: 640 }],
    name: `Album ${id}`,
  },
  artists: [
    {
      external_urls: { spotify: `https://open.spotify.com/artist/artist-${id}` },
      id: `${PREFIX}-artist-${id}`,
      name: `Artist ${id}`,
    },
  ],
  external_urls: { spotify: `https://open.spotify.com/track/track-${id}` },
  id: `${PREFIX}-track-${id}`,
  name: `Track ${id}`,
});

describe('fetchMusicHistoryPage', () => {
  beforeAll(async () => {
    ({ db } = await import('@dg/db'));
    ({ fetchMusicHistoryPage } = await import('../fetchMusicHistoryPage'));
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    // Clean up test data from all tables
    await getDb().MusicTrackArtist.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicTrack.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicAlbum.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicArtist.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  afterEach(async () => {
    await getDb().MusicTrackArtist.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicTrack.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicAlbum.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().MusicArtist.destroy({
      where: { id: { [Op.like]: `${PREFIX}-%` } },
    });
    await getDb().SpotifyPlay.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}-%` } },
    });
  });

  it('returns empty array when no plays exist', async () => {
    const result = await getFetchMusicHistoryPage()({});
    expect(result.tracks).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });

  it('fetches tracks from API when not cached', async () => {
    // Create play records
    await getDb().SpotifyPlay.bulkCreate([
      {
        albumId: `${PREFIX}-album-1`,
        artistIds: [`${PREFIX}-artist-1`],
        playedAt: new Date('2025-02-01T10:00:00.000Z'),
        trackId: `${PREFIX}-track-1`,
      },
    ]);

    // Mock API response for uncached track
    mockSpotifyGetWithRetry.mockResolvedValue({
      data: buildApiResponse('1'),
      status: 200,
      success: true,
    });

    const result = await getFetchMusicHistoryPage()({});

    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0]).toMatchObject({
      albumImageUrl: 'https://image.test/1.jpg',
      albumName: 'Album 1',
      artistNames: 'Artist 1',
      playedAt: '2025-02-01T10:00:00.000Z',
      trackId: `${PREFIX}-track-1`,
      trackName: 'Track 1',
      url: 'https://open.spotify.com/track/track-1',
    });

    // Verify track was cached
    const cachedTrack = await getDb().MusicTrack.findByPk(`${PREFIX}-track-1`);
    expect(cachedTrack).not.toBeNull();
  });

  it('uses cached data when available', async () => {
    // Pre-populate cache
    const displayData = buildTrackDisplayData('cached');
    const artist = displayData.artists[0];
    if (!artist) {
      throw new Error('Expected artist in test data');
    }
    await getDb().MusicArtist.create({
      id: artist.id,
      name: artist.name,
      url: artist.url,
    });
    await getDb().MusicAlbum.create(displayData.album);
    await getDb().MusicTrack.create({
      ...displayData.track,
      url: displayData.track.url,
    });
    await getDb().MusicTrackArtist.create({
      artistId: artist.id,
      position: 0,
      trackId: displayData.track.id,
    });

    // Create play record for cached track
    await getDb().SpotifyPlay.create({
      albumId: displayData.album.id,
      artistIds: [artist.id],
      playedAt: new Date('2025-02-01T12:00:00.000Z'),
      trackId: displayData.track.id,
    });

    const result = await getFetchMusicHistoryPage()({});

    // Should return data without calling API
    expect(mockSpotifyGetWithRetry).not.toHaveBeenCalled();
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0]).toMatchObject({
      trackId: displayData.track.id,
      trackName: 'Track cached',
    });
  });

  it('returns nextCursor when more results exist', async () => {
    // Create more plays than page size
    const plays = Array.from({ length: 5 }, (_, i) => ({
      albumId: `${PREFIX}-album-page`,
      artistIds: [`${PREFIX}-artist-page`],
      playedAt: new Date(Date.now() - i * 1000), // Staggered times
      trackId: `${PREFIX}-track-page-${i}`,
    }));
    await getDb().SpotifyPlay.bulkCreate(plays);

    // Mock API for all tracks
    mockSpotifyGetWithRetry.mockImplementation((resource: string) => {
      const trackId = resource.replace('tracks/', '');
      const idx = trackId.replace(`${PREFIX}-track-page-`, '');
      return Promise.resolve({
        data: buildApiResponse(`page-${idx}`),
        status: 200,
        success: true,
      });
    });

    // Request with small page size
    const result = await getFetchMusicHistoryPage()({ pageSize: 3 });

    expect(result.tracks).toHaveLength(3);
    expect(result.nextCursor).not.toBeNull();
  });
});
