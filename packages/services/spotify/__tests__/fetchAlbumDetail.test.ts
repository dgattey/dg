import { Op } from '@dg/db';

let db: typeof import('@dg/db').db | null = null;
type FetchAlbumDetail = (albumId: string) => Promise<{
  id: string;
  name: string;
  totalTracks: number;
  tracks: Array<{ id: string; name: string; trackNumber: number }>;
} | null>;

let fetchAlbumDetail: FetchAlbumDetail | null = null;

const getDb = () => {
  if (!db) {
    throw new Error('Test database not initialized');
  }
  return db;
};

const getFetchAlbumDetail = () => {
  if (!fetchAlbumDetail) {
    throw new Error('fetchAlbumDetail not initialized');
  }
  return fetchAlbumDetail;
};

const mockSpotifyGetWithRetry = jest.fn();

jest.mock('../trackMetadataShared', () => ({
  ...jest.requireActual('../trackMetadataShared'),
  spotifyGetWithRetry: (...args: Array<unknown>) => mockSpotifyGetWithRetry(...args),
}));

const PREFIX = 'ad';
const ALBUM_ID = `${PREFIX}album00000000000001`;
const ARTIST_ID = `${PREFIX}artist0000000000001`;
const TRACK_A = `${PREFIX}track0000000000000a`;
const TRACK_B = `${PREFIX}track0000000000000b`;

const spotifyAlbumResponse = {
  artists: [
    {
      external_urls: { spotify: `https://open.spotify.com/artist/${ARTIST_ID}` },
      id: ARTIST_ID,
      name: 'Test Artist',
    },
  ],
  external_urls: { spotify: `https://open.spotify.com/album/${ALBUM_ID}` },
  id: ALBUM_ID,
  images: [{ height: 640, url: 'https://image.test/album.jpg', width: 640 }],
  label: 'Test Label',
  name: 'Test Album',
  popularity: 42,
  release_date: '2020-05-01',
  total_tracks: 2,
  tracks: {
    items: [
      {
        artists: [
          {
            external_urls: { spotify: `https://open.spotify.com/artist/${ARTIST_ID}` },
            id: ARTIST_ID,
            name: 'Test Artist',
          },
        ],
        disc_number: 1,
        duration_ms: 120_000,
        external_urls: { spotify: `https://open.spotify.com/track/${TRACK_A}` },
        id: TRACK_A,
        name: 'First',
        track_number: 1,
      },
      {
        artists: [
          {
            external_urls: { spotify: `https://open.spotify.com/artist/${ARTIST_ID}` },
            id: ARTIST_ID,
            name: 'Test Artist',
          },
        ],
        disc_number: 1,
        duration_ms: 180_000,
        external_urls: { spotify: `https://open.spotify.com/track/${TRACK_B}` },
        id: TRACK_B,
        name: 'Second',
        track_number: 2,
      },
    ],
    next: null,
  },
};

describe('fetchAlbumDetail', () => {
  beforeAll(async () => {
    ({ db } = await import('@dg/db'));
    ({ fetchAlbumDetail } = await import('../fetchAlbumDetail'));
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await getDb().MusicTrackArtist.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicAlbumArtist.destroy({
      where: { albumId: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicTrack.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicAlbum.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicArtist.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
  });

  afterEach(async () => {
    await getDb().MusicTrackArtist.destroy({
      where: { trackId: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicAlbumArtist.destroy({
      where: { albumId: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicTrack.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicAlbum.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
    await getDb().MusicArtist.destroy({
      where: { id: { [Op.like]: `${PREFIX}%` } },
    });
  });

  it('returns a complete album from the database without calling Spotify', async () => {
    await getDb().MusicArtist.create({
      id: ARTIST_ID,
      name: 'Test Artist',
      url: `https://open.spotify.com/artist/${ARTIST_ID}`,
    });
    await getDb().MusicAlbum.create({
      id: ALBUM_ID,
      imageUrl: 'https://image.test/album.jpg',
      label: 'Test Label',
      name: 'Test Album',
      popularity: 42,
      releaseDate: '2020-05-01',
      totalTracks: 2,
      url: `https://open.spotify.com/album/${ALBUM_ID}`,
    });
    await getDb().MusicAlbumArtist.create({
      albumId: ALBUM_ID,
      artistId: ARTIST_ID,
      position: 0,
    });
    await getDb().MusicTrack.bulkCreate([
      {
        albumId: ALBUM_ID,
        discNumber: 1,
        durationMs: 120_000,
        id: TRACK_A,
        name: 'First',
        trackNumber: 1,
        url: `https://open.spotify.com/track/${TRACK_A}`,
      },
      {
        albumId: ALBUM_ID,
        discNumber: 1,
        durationMs: 180_000,
        id: TRACK_B,
        name: 'Second',
        trackNumber: 2,
        url: `https://open.spotify.com/track/${TRACK_B}`,
      },
    ]);
    await getDb().MusicTrackArtist.bulkCreate([
      { artistId: ARTIST_ID, position: 0, trackId: TRACK_A },
      { artistId: ARTIST_ID, position: 0, trackId: TRACK_B },
    ]);

    const detail = await getFetchAlbumDetail()(ALBUM_ID);

    expect(mockSpotifyGetWithRetry).not.toHaveBeenCalled();
    expect(detail?.name).toBe('Test Album');
    expect(detail?.totalTracks).toBe(2);
    expect(detail?.tracks.map((track) => track.name)).toEqual(['First', 'Second']);
  });

  it('falls back to Spotify and writes through when the cache is incomplete', async () => {
    mockSpotifyGetWithRetry.mockResolvedValueOnce({
      data: spotifyAlbumResponse,
      status: 200,
      success: true,
    });

    const detail = await getFetchAlbumDetail()(ALBUM_ID);

    expect(mockSpotifyGetWithRetry).toHaveBeenCalledWith(
      `albums/${ALBUM_ID}`,
      expect.anything(),
      'album detail',
    );
    expect(detail?.tracks).toHaveLength(2);

    const cachedAlbum = await getDb().MusicAlbum.findByPk(ALBUM_ID);
    expect(cachedAlbum?.totalTracks).toBe(2);
    expect(cachedAlbum?.label).toBe('Test Label');

    const cachedTracks = await getDb().MusicTrack.findAll({ where: { albumId: ALBUM_ID } });
    expect(cachedTracks).toHaveLength(2);
    expect(cachedTracks.every((track) => track.trackNumber != null)).toBe(true);

    mockSpotifyGetWithRetry.mockClear();
    const second = await getFetchAlbumDetail()(ALBUM_ID);
    expect(mockSpotifyGetWithRetry).not.toHaveBeenCalled();
    expect(second?.id).toBe(ALBUM_ID);
  });

  it('returns null for an unknown album id', async () => {
    mockSpotifyGetWithRetry.mockResolvedValueOnce({
      error: 'HTTP 404',
      status: 404,
      success: false,
    });

    await expect(getFetchAlbumDetail()(`${PREFIX}missing00000000001`)).resolves.toBeNull();
  });
});
