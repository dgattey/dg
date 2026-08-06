import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const push = jest.fn();

/** Points the mocked router hooks at a query, as the URL would after a nav. */
const mockUrl = (query = '') => {
  jest
    .mocked(useSearchParams)
    .mockReturnValue(new URLSearchParams(query) as ReturnType<typeof useSearchParams>);
};

beforeEach(() => {
  push.mockClear();
  jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
  mockUrl();
});

const albums: Array<PlaylistAlbum> = [
  {
    addedAt: '2026-03-01T00:00:00Z',
    artistNames: 'Alpha',
    id: 'album-zebra',
    imageUrl: 'https://i.scdn.co/image/zebra',
    name: 'Zebra',
    primaryArtist: 'Alpha',
    releaseDate: '2001-05-01',
    url: 'https://open.spotify.com/album/zebra',
  },
  {
    addedAt: '2026-02-01T00:00:00Z',
    artistNames: 'Zulu',
    id: 'album-mango',
    imageUrl: 'https://i.scdn.co/image/mango',
    name: 'Mango',
    primaryArtist: 'Zulu',
    releaseDate: '2010',
    url: 'https://open.spotify.com/album/mango',
  },
  {
    addedAt: '2026-01-01T00:00:00Z',
    artistNames: 'Mike, Guest',
    id: 'album-apple',
    imageUrl: 'https://i.scdn.co/image/apple',
    name: 'Apple',
    primaryArtist: 'Mike',
    releaseDate: '2020-11-20',
    url: 'https://open.spotify.com/album/apple',
  },
];

const renderedAlbumNames = () =>
  screen.getAllByRole('img').map((image) => image.getAttribute('alt'));

/** Clicks a sort option in the GlassSwitcher (hidden radio inside a label). */
const clickSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('radio', { hidden: true, name: label }));
};

describe('FavoriteAlbumsGrid', () => {
  it('defaults to newest added first and links each album to its detail route', () => {
    render(<FavoriteAlbumsGrid albums={albums} />);

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);

    const link = screen.getByRole('link', { name: 'Zebra' });
    expect(link).toHaveAttribute('href', '/music/albums?album=album-zebra');
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('expands the album named in the query and offers its cell as the way back', () => {
    mockUrl('album=album-zebra');

    render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>streamed tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Zebra details' })).toBeInTheDocument();
    expect(screen.getByText('streamed tracklist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Close Zebra' })).toHaveAttribute(
      'href',
      '/music/albums',
    );
  });

  it('sorts by album name', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');

    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('sorts by artist name', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Artist');

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Apple', 'Mango']);
  });

  it('sorts by release date, newest first', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Release date');

    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('opens the clicked album immediately, holding a skeleton until detail lands', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    const { container } = render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>zebra tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    await user.click(screen.getByRole('link', { name: 'Mango' }));

    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(screen.queryByText('zebra tracklist')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/music/albums?album=album-mango',
        expect.objectContaining({ transitionTypes: ['album-open'] }),
      );
    });
  });

  it('swaps the skeleton for streamed detail once the URL names the same album', async () => {
    const user = userEvent.setup();
    const view = render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>mango tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    await user.click(screen.getByRole('link', { name: 'Mango' }));
    expect(screen.queryByText('mango tracklist')).not.toBeInTheDocument();

    mockUrl('album=album-mango');
    view.rerender(
      <FavoriteAlbumsGrid albums={albums}>
        <p>mango tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(screen.getByText('mango tracklist')).toBeInTheDocument();
  });

  it('lets the URL win when it moves somewhere the click never pointed', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    const view = render(<FavoriteAlbumsGrid albums={albums} />);
    await user.click(screen.getByRole('link', { name: 'Mango' }));
    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();

    mockUrl('album=album-apple');
    view.rerender(
      <FavoriteAlbumsGrid albums={albums}>
        <p>apple tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Apple details' })).toBeInTheDocument();
    expect(screen.getByText('apple tracklist')).toBeInTheDocument();
  });

  it('retires a click for good, so going back cannot revive it', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    const view = render(<FavoriteAlbumsGrid albums={albums} />);
    await user.click(screen.getByRole('link', { name: 'Mango' }));

    const rerenderAt = (query: string) => {
      mockUrl(query);
      view.rerender(<FavoriteAlbumsGrid albums={albums} />);
    };

    rerenderAt('album=album-mango');
    rerenderAt('album=album-zebra');

    expect(screen.getByRole('region', { name: 'Zebra details' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Mango details' })).not.toBeInTheDocument();
  });

  it('closes the well on click without waiting for the navigation', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>zebra tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    await user.click(screen.getByRole('link', { name: 'Close Zebra' }));

    expect(screen.queryByRole('region', { name: 'Zebra details' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/music/albums',
        expect.objectContaining({ transitionTypes: ['album-close'] }),
      );
    });
  });

  it('returns to the default order via recently added', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');
    await clickSort(user, 'Recently added');

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });
});
