/**
 * @jest-environment node
 */
import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { useRouter, useSearchParams } from 'next/navigation';
import { renderToString } from 'react-dom/server';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

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

const renderGrid = () =>
  renderToString(
    <FavoriteAlbumsGrid albums={albums}>
      <p>Mango tracklist</p>
    </FavoriteAlbumsGrid>,
  );

const albumLinks = (html: string) =>
  [...html.matchAll(/href="\/music\/albums\?album=([^"]+)"/g)].map(([, id]) => id);

beforeEach(() => {
  jest
    .mocked(useRouter)
    .mockReturnValue({ push: jest.fn() } as unknown as ReturnType<typeof useRouter>);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('FavoriteAlbumsGrid on the server', () => {
  it('renders every album tile while the query is still unknown', () => {
    jest.mocked(useSearchParams).mockImplementation(() => {
      throw new Error('query not available during prerender');
    });

    const html = renderGrid();

    expect(albumLinks(html)).toEqual(['album-zebra', 'album-mango']);
    expect(html).not.toContain('Mango details');
  });

  it('renders the same tiles plus the well for a deep-linked album', () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValue(
        new URLSearchParams('album=album-mango') as ReturnType<typeof useSearchParams>,
      );

    const html = renderGrid();

    expect(albumLinks(html)).toEqual(['album-zebra', 'album-mango']);
    expect(html).toContain('aria-label="Mango details"');
    expect(html).toContain('Mango tracklist');
  });
});
