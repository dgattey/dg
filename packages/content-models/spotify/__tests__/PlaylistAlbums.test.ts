import { mapPlaylistAlbumsFromApi } from '../PlaylistAlbums';

const buildTrack = (overrides: {
  albumId: string;
  albumName?: string;
  artistNames?: Array<string>;
  releaseDate?: string;
}) => {
  const { albumId, albumName = `Album ${albumId}`, artistNames = ['Artist'] } = overrides;
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
      ...reference(albumId, albumName),
      external_urls: { spotify: `https://open.spotify.com/album/${albumId}` },
      images: [
        { height: 640, url: `https://image.test/${albumId}-640.jpg`, width: 640 },
        { height: 300, url: `https://image.test/${albumId}-300.jpg`, width: 300 },
      ],
      release_date: overrides.releaseDate ?? '2020-01-01',
    },
    artists: artistNames.map((name, index) => reference(`artist-${albumId}-${index}`, name)),
  };
};

const buildItem = (addedAt: string, track: unknown) => ({ added_at: addedAt, track });

describe('mapPlaylistAlbumsFromApi', () => {
  it('dedupes tracks into unique albums, newest added first', () => {
    const albums = mapPlaylistAlbumsFromApi([
      buildItem('2024-01-01T00:00:00Z', buildTrack({ albumId: 'a' })),
      buildItem('2025-06-01T00:00:00Z', buildTrack({ albumId: 'b' })),
      buildItem('2024-03-01T00:00:00Z', buildTrack({ albumId: 'a' })),
    ]);

    expect(albums.map((album) => album.id)).toEqual(['b', 'a']);
  });

  it('keeps the earliest add date for a deduped album', () => {
    const albums = mapPlaylistAlbumsFromApi([
      buildItem('2024-05-01T00:00:00Z', buildTrack({ albumId: 'a' })),
      buildItem('2024-01-01T00:00:00Z', buildTrack({ albumId: 'a' })),
    ]);

    expect(albums).toHaveLength(1);
    expect(albums[0]?.addedAt).toBe('2024-01-01T00:00:00Z');
  });

  it('flattens album fields including artists and preferred image', () => {
    const albums = mapPlaylistAlbumsFromApi([
      buildItem(
        '2024-01-01T00:00:00Z',
        buildTrack({
          albumId: 'a',
          albumName: 'In Rainbows',
          artistNames: ['Radiohead', 'Guest'],
          releaseDate: '2007-10-10',
        }),
      ),
    ]);

    expect(albums[0]).toEqual({
      addedAt: '2024-01-01T00:00:00Z',
      artistNames: 'Radiohead, Guest',
      id: 'a',
      imageUrl: 'https://image.test/a-640.jpg',
      name: 'In Rainbows',
      primaryArtist: 'Radiohead',
      releaseDate: '2007-10-10',
      url: 'https://open.spotify.com/album/a',
    });
  });

  it('skips null tracks, unparseable items, and albums without art', () => {
    const noImages = buildTrack({ albumId: 'no-art' });
    noImages.album.images = [];

    const albums = mapPlaylistAlbumsFromApi([
      buildItem('2024-01-01T00:00:00Z', null),
      { unexpected: 'shape' },
      buildItem('2024-01-02T00:00:00Z', noImages),
      buildItem('2024-01-03T00:00:00Z', buildTrack({ albumId: 'ok' })),
    ]);

    expect(albums.map((album) => album.id)).toEqual(['ok']);
  });
});
