const mockGet = jest.fn();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockGet }),
}));

import { fetchPlaylistAlbums } from '../fetchPlaylistAlbums';

const buildTrack = (albumId: string) => {
  const reference = (id: string, name: string) => ({
    external_urls: { spotify: `https://open.spotify.com/x/${id}` },
    href: `https://api.spotify.com/v1/x/${id}`,
    id,
    name,
    uri: `spotify:x:${id}`,
  });
  return {
    ...reference(`track-${albumId}`, `Track ${albumId}`),
    album: {
      ...reference(albumId, `Album ${albumId}`),
      images: [{ height: 640, url: `https://image.test/${albumId}.jpg`, width: 640 }],
      release_date: '2020-01-01',
    },
    artists: [reference(`artist-${albumId}`, `Artist ${albumId}`)],
  };
};

const buildPage = (albumIds: Array<string>, next: string | null) => ({
  response: {
    json: async () => ({
      items: albumIds.map((albumId, index) => ({
        added_at: `2024-01-0${index + 1}T00:00:00Z`,
        track: buildTrack(albumId),
      })),
      next,
    }),
  },
  status: 200,
});

describe('fetchPlaylistAlbums', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('pages through the playlist and dedupes albums across pages', async () => {
    mockGet
      .mockResolvedValueOnce(buildPage(['a', 'b'], 'https://api.spotify.com/next'))
      .mockResolvedValueOnce(buildPage(['a', 'c'], null));

    const albums = await fetchPlaylistAlbums('playlist-id');

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'playlists/playlist-id/tracks?limit=50&offset=0');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'playlists/playlist-id/tracks?limit=50&offset=50');
    expect(albums.map((album) => album.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('fails immediately on a rate limit so the cron can try next run', async () => {
    mockGet.mockResolvedValue({ response: { json: async () => ({}) }, status: 429 });

    const started = Date.now();
    await expect(fetchPlaylistAlbums('playlist-id')).rejects.toThrow('status 429');

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('throws when the live read fails and nothing is stored', async () => {
    mockGet.mockResolvedValueOnce({ response: { json: async () => ({}) }, status: 403 });

    await expect(fetchPlaylistAlbums('playlist-id')).rejects.toThrow('status 403');
  });
});
