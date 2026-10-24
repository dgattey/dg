import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchMusicHistoryPage } from '../fetchMusicHistoryPage';

const mockSpotifyGetWithRetry = jest.fn();

jest.mock('../trackMetadataShared', () => ({
  ...jest.requireActual('../trackMetadataShared'),
  spotifyGet: (...args: Array<unknown>) => mockSpotifyGetWithRetry(...args),
}));

const db = setupTestDatabase();

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when no plays exist', async () => {
    const result = await fetchMusicHistoryPage({});
    expect(result.tracks).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });

  it('degrades to an empty page when the database is unreachable', async () => {
    const spy = jest
      .spyOn(db.SpotifyPlay, 'findAll')
      .mockRejectedValueOnce(new Error('Neon network transfer limit exceeded'));
    try {
      await expect(fetchMusicHistoryPage({})).resolves.toEqual({
        nextCursor: null,
        tracks: [],
      });
    } finally {
      spy.mockRestore();
    }
  });

  it('fetches tracks from API when not cached', async () => {
    // Create play records
    await db.SpotifyPlay.bulkCreate([
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

    const result = await fetchMusicHistoryPage({});

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
    const cachedTrack = await db.MusicTrack.findByPk(`${PREFIX}-track-1`);
    expect(cachedTrack).not.toBeNull();
  });

  it('uses cached data when available', async () => {
    // Pre-populate cache
    const displayData = buildTrackDisplayData('cached');
    const artist = displayData.artists[0];
    if (!artist) {
      throw new Error('Expected artist in test data');
    }
    await db.MusicArtist.create({
      id: artist.id,
      name: artist.name,
      url: artist.url,
    });
    await db.MusicAlbum.create(displayData.album);
    await db.MusicTrack.create({
      ...displayData.track,
      url: displayData.track.url,
    });
    await db.MusicTrackArtist.create({
      artistId: artist.id,
      position: 0,
      trackId: displayData.track.id,
    });

    // Create play record for cached track
    await db.SpotifyPlay.create({
      albumId: displayData.album.id,
      artistIds: [artist.id],
      playedAt: new Date('2025-02-01T12:00:00.000Z'),
      trackId: displayData.track.id,
    });

    const result = await fetchMusicHistoryPage({});

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
    await db.SpotifyPlay.bulkCreate(plays);

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
    const result = await fetchMusicHistoryPage({ pageSize: 3 });

    expect(result.tracks).toHaveLength(3);
    expect(result.nextCursor).not.toBeNull();
  });

  it('labels plays by artists first played this week, but not artists heard years ago', async () => {
    const now = Date.now();
    await db.SpotifyPlay.bulkCreate([
      {
        albumId: `${PREFIX}-album-new`,
        artistIds: [`${PREFIX}-artist-new`],
        playedAt: new Date(now - 1000),
        trackId: `${PREFIX}-track-new`,
      },
      {
        albumId: `${PREFIX}-album-old`,
        artistIds: [`${PREFIX}-artist-old`],
        playedAt: new Date(now - 2000),
        trackId: `${PREFIX}-track-old`,
      },
      {
        albumId: `${PREFIX}-album-old`,
        artistIds: [`${PREFIX}-artist-old`],
        playedAt: new Date('2020-06-01T12:00:00.000Z'),
        trackId: `${PREFIX}-track-old`,
      },
    ]);
    mockSpotifyGetWithRetry.mockImplementation((resource: string) =>
      Promise.resolve({
        data: buildApiResponse(resource.replace(`tracks/${PREFIX}-track-`, '')),
        status: 200,
        success: true,
      }),
    );

    const result = await fetchMusicHistoryPage({ pageSize: 2 });

    expect(result.tracks.map((track) => [track.trackId, track.newArtist])).toEqual([
      [`${PREFIX}-track-new`, 'New artist this week'],
      [`${PREFIX}-track-old`, null],
    ]);
  });
});
