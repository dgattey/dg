import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadAlbumDetail } from '../../../../services/albumDetail.actions';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

jest.mock('../../../../services/albumDetail.actions', () => ({
  loadAlbumDetail: jest.fn(),
}));

const detailFor = (id: string, name: string, trackTitle: string): AlbumDetail => ({
  artists: [{ id: `artist-${id}`, name: 'Alpha', url: `https://open.spotify.com/artist/${id}` }],
  durationMs: 180_000,
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  label: null,
  name,
  popularity: 50,
  releaseDate: '2020-01-01',
  totalTracks: 1,
  tracks: [
    {
      artists: [
        { id: `artist-${id}`, name: 'Alpha', url: `https://open.spotify.com/artist/${id}` },
      ],
      discNumber: 1,
      durationMs: 180_000,
      id: `track-${id}`,
      name: trackTitle,
      trackNumber: 1,
      url: `https://open.spotify.com/track/${id}`,
    },
  ],
  url: `https://open.spotify.com/album/${id}`,
});

const DETAIL_BY_ID: Record<string, AlbumDetail> = {
  'album-apple': detailFor('album-apple', 'Apple', 'apple tracklist'),
  'album-mango': detailFor('album-mango', 'Mango', 'mango tracklist'),
  'album-zebra': detailFor('album-zebra', 'Zebra', 'zebra tracklist'),
};

const setUrl = (query = '') => {
  window.history.replaceState(null, '', query ? `/music/albums?${query}` : '/music/albums');
};

beforeEach(() => {
  jest.mocked(loadAlbumDetail).mockImplementation(async (albumId) => DETAIL_BY_ID[albumId] ?? null);
  setUrl();
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

const clickSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('button', { name: label }));
};

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
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  it('renders both sort buttons and album cards immediately', () => {
    render(<FavoriteAlbumsGrid albums={albums} />);

    expect(screen.getByRole('link', { name: /Zebra/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recently added' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Album' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Artist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Release date' })).toBeInTheDocument();
  });

  it('renders linked, sleeved albums newest first', () => {
    const { container } = render(<FavoriteAlbumsGrid albums={albums} />);

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
    const link = screen.getByRole('link', { name: /Zebra/ });
    expect(link).toHaveAttribute('href', '/music/albums?album=album-zebra');
    expect(link).not.toHaveAttribute('target', '_blank');
    const coversPerCell = [...container.querySelectorAll('a')].map(
      (link) => link.querySelectorAll('img').length,
    );
    expect(coversPerCell).toEqual([3, 3, 3]);
  });

  it('loads the first mobile screen eagerly at high priority', () => {
    const fiveAlbums = [
      ...albums,
      ...albums.slice(0, 2).map((album) => ({
        ...album,
        addedAt: album.addedAt.replace('2026', '2025'),
        id: `${album.id}-again`,
      })),
    ];
    const { container } = render(<FavoriteAlbumsGrid albums={fiveAlbums} />);

    const cellPriorities = [...container.querySelectorAll('a')].map((link) => {
      const priorities = [...link.querySelectorAll('img')].map(
        (image) =>
          `${image.getAttribute('loading')}/${image.getAttribute('fetchpriority') ?? 'auto'}`,
      );
      return priorities.join(',');
    });
    expect(cellPriorities).toEqual([
      'lazy/auto,lazy/auto,eager/high',
      'lazy/auto,lazy/auto,eager/high',
      'lazy/auto,lazy/auto,eager/high',
      'lazy/auto,lazy/auto,eager/high',
      'lazy/auto,lazy/auto,lazy/auto',
    ]);
  });

  it('sorts cards through paper controls without changing album behavior', async () => {
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

  it('opens and closes wells with deep-link semantics', async () => {
    const user = userEvent.setup();
    setUrl('album=album-zebra');

    render(<FavoriteAlbumsGrid albums={albums} />);

    expect(screen.getByRole('region', { name: 'Zebra details' })).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Open zebra tracklist on Spotify' }),
    ).toBeInTheDocument();
    const close = screen.getByRole('link', { name: 'Close Zebra' });
    expect(close).toHaveAttribute('href', '/music/albums');
    expect(close).toHaveTextContent('×');

    await user.click(close);

    expect(screen.queryByRole('region', { name: 'Zebra details' })).not.toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe('/music/albums');
  });

  it('opens with a skeleton immediately on click, updates the URL, and shows loaded detail', async () => {
    const user = userEvent.setup();
    setUrl('album=album-zebra');

    let resolveMango: ((detail: AlbumDetail | null) => void) | undefined;
    jest.mocked(loadAlbumDetail).mockImplementation((albumId) => {
      if (albumId === 'album-mango') {
        return new Promise((resolve) => {
          resolveMango = resolve;
        });
      }
      return Promise.resolve(DETAIL_BY_ID[albumId] ?? null);
    });

    const view = render(<FavoriteAlbumsGrid albums={albums} />);
    expect(
      await screen.findByRole('link', { name: 'Open zebra tracklist on Spotify' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Mango/ }));

    expect(window.location.pathname + window.location.search).toBe(
      '/music/albums?album=album-mango',
    );
    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Open zebra tracklist on Spotify' }),
    ).not.toBeInTheDocument();
    expect(view.container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0);

    act(() => {
      resolveMango?.(DETAIL_BY_ID['album-mango'] ?? null);
    });

    expect(
      await screen.findByRole('link', { name: 'Open mango tracklist on Spotify' }),
    ).toBeInTheDocument();
  });

  it('syncs the open well when popstate navigates history', async () => {
    const user = userEvent.setup();
    setUrl('album=album-zebra');

    render(<FavoriteAlbumsGrid albums={albums} />);
    await user.click(screen.getByRole('link', { name: /Mango/ }));
    expect(screen.getByRole('region', { name: 'Mango details' })).toBeInTheDocument();

    act(() => {
      setUrl('album=album-apple');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByRole('region', { name: 'Apple details' })).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Open apple tracklist on Spotify' }),
    ).toBeInTheDocument();

    act(() => {
      setUrl();
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.queryByRole('region', { name: 'Apple details' })).not.toBeInTheDocument();
  });

  it('slides the cells that moved from where they were to where they landed', async () => {
    const animate = jest.fn();
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate });
    layOutBySiblingOrder();
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');

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
