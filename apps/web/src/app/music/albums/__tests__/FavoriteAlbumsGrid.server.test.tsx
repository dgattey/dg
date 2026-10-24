/**
 * @jest-environment node
 */
import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { renderToString } from 'react-dom/server';
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

const renderGrid = () => renderToString(<FavoriteAlbumsGrid albums={albums} />);

const albumLinks = (html: string) =>
  [...html.matchAll(/href="\/music\/albums\?album=([^"]+)"/g)].map(([, id]) => id);

describe('FavoriteAlbumsGrid on the server', () => {
  it('renders every album tile statically without reading searchParams on the server', () => {
    const html = renderGrid();

    expect(albumLinks(html)).toEqual(['album-zebra', 'album-mango']);
    expect(html).not.toContain('Mango details');
  });
});
