import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { markClientHydrated, resetClientHydrated } from '../../../../layouts/clientHydrated';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';
import { FavoriteAlbumsSkeleton } from '../FavoriteAlbumsSkeleton';

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

/**
 * Clicks a sort option in the GlassSwitcher (hidden radio inside a label).
 *
 * Scoped to the desktop row on purpose: the switcher also renders a mobile
 * disclosure with its own radio per option, and only CSS picks between them.
 */
const clickSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  const desktopSwitcher = document.querySelector('[data-role="glass-switcher"]') as HTMLElement;
  await user.click(within(desktopSwitcher).getByRole('radio', { hidden: true, name: label }));
};

const clickCollageSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('button', { name: label }));
};

/**
 * Lays every element out at 100px per sibling so a cell that changes position
 * in the grid reports a different rect before and after a sort.
 */
const layOutBySiblingOrder = () => {
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const left = [...(this.parentElement?.children ?? [])].indexOf(this) * 100;
    return { height: 100, left, top: 0, width: 100 } as DOMRect;
  });
};

describe('FavoriteAlbumsGrid', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetClientHydrated();
    Reflect.deleteProperty(document, 'getAnimations');
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  it('holds the height-matched skeleton while a view transition is running', () => {
    markClientHydrated();
    Object.defineProperty(document, 'getAnimations', {
      configurable: true,
      value: () => [
        {
          effect: { pseudoElement: '::view-transition-new(root)' },
          finished: new Promise<void>(() => {
            /* stay pending for this render */
          }),
        },
      ],
    });

    render(<FavoriteAlbumsGrid albums={albums} />);

    expect(screen.queryByRole('link', { name: 'Zebra' })).not.toBeInTheDocument();
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBe(1);
  });

  it('reveals albums after view-transition animations finish', async () => {
    markClientHydrated();
    let resolveFinished = () => {};
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    Object.defineProperty(document, 'getAnimations', {
      configurable: true,
      value: () => [
        {
          effect: { pseudoElement: '::view-transition-new(root)' },
          finished,
        },
      ],
    });

    render(<FavoriteAlbumsGrid albums={albums} />);
    expect(screen.queryByRole('link', { name: 'Zebra' })).not.toBeInTheDocument();

    resolveFinished();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Zebra' })).toBeInTheDocument();
    });
  });

  it('renders linked, sleeved albums newest first', () => {
    const { container } = render(<FavoriteAlbumsGrid albums={albums} />);

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
    const link = screen.getByRole('link', { name: 'Zebra' });
    expect(link).toHaveAttribute('href', '/music/albums?album=album-zebra');
    expect(link).not.toHaveAttribute('target', '_blank');
    const coversPerCell = [...container.querySelectorAll('a')].map(
      (link) => link.querySelectorAll('img').length,
    );
    expect(coversPerCell).toEqual([3, 3, 3]);
  });

  it('expands the URL album while preserving its sleeved close socket', () => {
    mockUrl('album=album-zebra');

    render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>streamed tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Zebra details' })).toBeInTheDocument();
    expect(screen.getByText('streamed tracklist')).toBeInTheDocument();
    const close = screen.getByRole('link', { name: 'Close Zebra' });
    expect(close).toHaveAttribute('href', '/music/albums');
    expect(close.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getAllByAltText('Zebra')).toHaveLength(1);
  });

  it('sorts the classic grid by each option and returns to recently added', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');
    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);

    await clickSort(user, 'Artist');
    expect(renderedAlbumNames()).toEqual(['Zebra', 'Apple', 'Mango']);

    await clickSort(user, 'Release date');
    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);

    await clickSort(user, 'Recently added');
    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });

  it('renders collage paper cards with captions and full-color art', () => {
    const { container } = render(<FavoriteAlbumsGrid albums={albums} surface="collage" />);

    const zebra = screen.getByRole('link', { name: 'Zebra' });
    expect(zebra.querySelector('[data-role="album-caption"]')).toHaveTextContent('ZebraAlpha');
    expect(screen.getByRole('link', { name: 'Mango' })).toHaveTextContent('MangoZulu');
    expect(screen.getByRole('link', { name: 'Apple' })).toHaveTextContent('AppleMike, Guest');
    expect(container.querySelectorAll('[data-image-treatment="full-color"]')).toHaveLength(3);
  });

  it('sorts collage cards through paper controls without changing album behavior', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} surface="collage" />);

    await clickCollageSort(user, 'Album');
    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);

    await clickCollageSort(user, 'Artist');
    expect(renderedAlbumNames()).toEqual(['Zebra', 'Apple', 'Mango']);

    await clickCollageSort(user, 'Release date');
    expect(renderedAlbumNames()).toEqual(['Apple', 'Mango', 'Zebra']);

    await clickCollageSort(user, 'Recently added');
    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });

  it('opens and closes collage wells with the same deep-link semantics', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    render(
      <FavoriteAlbumsGrid albums={albums} surface="collage">
        <p>zebra tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Zebra details' })).toBeInTheDocument();
    expect(screen.getByText('zebra tracklist')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    const close = screen.getByRole('link', { name: 'Close Zebra' });
    expect(close).toHaveAttribute('href', '/music/albums');
    expect(close).toHaveTextContent('×');

    await user.click(close);

    expect(screen.queryByRole('region', { name: 'Zebra details' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/music/albums',
        expect.objectContaining({ transitionTypes: ['album-close'] }),
      );
    });
  });

  it('opens a collage card optimistically before its detail streams', async () => {
    const user = userEvent.setup();
    const { container } = render(<FavoriteAlbumsGrid albums={albums} surface="collage" />);

    await user.click(screen.getByRole('link', { name: 'Mango' }));

    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(container.querySelector('[data-role="album-detail-placeholder"]')).not.toBeNull();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/music/albums?album=album-mango',
        expect.objectContaining({ transitionTypes: ['album-open'] }),
      );
    });
  });

  it('uses collage layout skeletons without changing the classic skeleton', () => {
    const classic = render(<FavoriteAlbumsSkeleton tileCount={3} />);

    expect(classic.container.querySelector('[data-role="collage-album-skeleton-grid"]')).toBeNull();
    expect(classic.container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(4);

    classic.rerender(<FavoriteAlbumsSkeleton surface="collage" tileCount={3} />);

    expect(screen.getByRole('status', { name: 'Loading album sort controls' })).toBeInTheDocument();
    const collageGrid = classic.container.querySelector(
      '[data-role="collage-album-skeleton-grid"]',
    );
    expect(collageGrid).not.toBeNull();
    expect(collageGrid?.children).toHaveLength(3);
    expect(classic.container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(13);

    classic.rerender(<FavoriteAlbumsSkeleton reserveOnly surface="collage" tileCount={3} />);

    expect(classic.container.querySelector('[data-role="collage-album-skeleton-grid"]')).toBeNull();
    expect(classic.container.querySelector('[data-role="collage-album-reserve"]')).not.toBeNull();
    expect(classic.container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(4);
  });

  it('opens with a skeleton before navigation, then shows matching streamed detail', async () => {
    const user = userEvent.setup();
    mockUrl('album=album-zebra');

    const view = render(
      <FavoriteAlbumsGrid albums={albums}>
        <p>zebra tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    await user.click(screen.getByRole('link', { name: 'Mango' }));

    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(screen.queryByText('zebra tracklist')).not.toBeInTheDocument();
    expect(view.container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/music/albums?album=album-mango',
        expect.objectContaining({ transitionTypes: ['album-open'] }),
      );
    });

    mockUrl('album=album-mango');
    view.rerender(
      <FavoriteAlbumsGrid albums={albums}>
        <p>mango tracklist</p>
      </FavoriteAlbumsGrid>,
    );

    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(screen.getByText('mango tracklist')).toBeInTheDocument();
  });

  it('lets URL changes retire a pending click permanently', async () => {
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

    mockUrl('album=album-zebra');
    view.rerender(<FavoriteAlbumsGrid albums={albums} />);
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

  it('slides the cells that moved from where they were to where they landed', async () => {
    const animate = jest.fn();
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate });
    layOutBySiblingOrder();
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');

    // Zebra and Apple swap ends; Mango holds the middle and stays still.
    expect(animate).toHaveBeenCalledTimes(2);
    expect(animate).toHaveBeenCalledWith(
      [{ transform: 'translate(200px, 0px)' }, { transform: 'translate(0, 0)' }],
      expect.objectContaining({ duration: expect.any(Number) }),
    );
    expect(animate).toHaveBeenCalledWith(
      [{ transform: 'translate(-200px, 0px)' }, { transform: 'translate(0, 0)' }],
      expect.objectContaining({ duration: expect.any(Number) }),
    );
  });
});
