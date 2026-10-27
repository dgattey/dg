/**
 * @jest-environment node
 */
import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { renderToReadableStream, renderToString } from 'react-dom/server';
import { loadAlbumDetail } from '../../../../services/albumDetail.actions';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

jest.mock('../../../../services/albumDetail.actions', () => ({
  loadAlbumDetail: jest.fn().mockResolvedValue(null),
}));

const album = (id: string, name: string): PlaylistAlbum => ({
  addedAt: '2026-01-01T00:00:00Z',
  artistNames: 'Artist',
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  name,
  primaryArtist: 'Artist',
  releaseDate: '2020',
  url: `https://open.spotify.com/album/${id}`,
});

const albums = [album('album-zebra', 'Zebra'), album('album-mango', 'Mango')];

const mangoDetail: AlbumDetail = {
  artists: [{ id: 'artist-mango', name: 'Artist', url: 'https://open.spotify.com/artist/mango' }],
  durationMs: 180_000,
  id: 'album-mango',
  imageUrl: 'https://i.scdn.co/image/album-mango',
  label: null,
  name: 'Mango',
  popularity: 50,
  releaseDate: '2020-01-01',
  totalTracks: 1,
  tracks: [
    {
      artists: [
        { id: 'artist-mango', name: 'Artist', url: 'https://open.spotify.com/artist/mango' },
      ],
      discNumber: 1,
      durationMs: 180_000,
      id: 'track-mango',
      name: 'mango tracklist',
      trackNumber: 1,
      url: 'https://open.spotify.com/track/mango',
    },
  ],
  url: 'https://open.spotify.com/album/album-mango',
};

const renderGrid = () => renderToString(<FavoriteAlbumsGrid albums={albums} />);

const albumLinks = (html: string) =>
  [...html.matchAll(/href="\/music\/albums\?album=([^"#]+)#album-\1"/g)].map(([, id]) => id);

describe('FavoriteAlbumsGrid on the server', () => {
  it('renders every album tile statically without reading searchParams on the server', () => {
    const html = renderGrid();

    expect(albumLinks(html)).toEqual(['album-zebra', 'album-mango']);
    expect(html).not.toContain('Mango details');
  });

  it('renders the selected album open, with its streamed tracklist, in the server HTML', async () => {
    const stream = await renderToReadableStream(
      <FavoriteAlbumsGrid
        albums={albums}
        initialAlbumId="album-mango"
        initialDetail={Promise.resolve(mangoDetail)}
      />,
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain('aria-label="Mango details"');
    expect(html).toContain('mango tracklist');
    expect(html).toContain('aria-label="Close Mango"');
    expect(loadAlbumDetail).not.toHaveBeenCalled();
  });
});
