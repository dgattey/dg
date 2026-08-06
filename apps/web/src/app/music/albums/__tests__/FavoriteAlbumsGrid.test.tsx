import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

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
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  it('defaults to newest added first and links each album to its detail route', () => {
    render(<FavoriteAlbumsGrid albums={albums} />);

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);

    const link = screen.getByRole('link', { name: 'Zebra' });
    expect(link).toHaveAttribute('href', '/music/albums?album=album-zebra');
    expect(link).not.toHaveAttribute('target', '_blank');
  });

  it('fans sleeves behind every cover, since every favorite is a whole album', () => {
    const { container } = render(<FavoriteAlbumsGrid albums={albums} />);

    const coversPerCell = [...container.querySelectorAll('a')].map(
      (link) => link.querySelectorAll('img').length,
    );
    expect(coversPerCell).toEqual([3, 3, 3]);
    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });

  it('keeps a collapsed cell fanned while its only named cover flies to the well', () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValueOnce(
        new URLSearchParams('album=album-zebra') as ReturnType<typeof useSearchParams>,
      );

    render(<FavoriteAlbumsGrid albums={albums} />);

    const collapsed = screen.getByRole('link', { name: 'Close Zebra' });
    expect(collapsed.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getAllByAltText('Zebra')).toHaveLength(1);
  });

  it('expands the album named in the query and offers its cell as the way back', () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValueOnce(
        new URLSearchParams('album=album-zebra') as ReturnType<typeof useSearchParams>,
      );

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

  it('returns to the default order via recently added', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');
    await clickSort(user, 'Recently added');

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });
});
