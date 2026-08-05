import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoriteAlbumsGrid } from '../FavoriteAlbumsGrid';

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
    expect(link).toHaveAttribute('href', '/music/albums/album-zebra');
    expect(link).not.toHaveAttribute('target', '_blank');
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

  it('returns to the default order via recently added', async () => {
    const user = userEvent.setup();
    render(<FavoriteAlbumsGrid albums={albums} />);

    await clickSort(user, 'Album');
    await clickSort(user, 'Recently added');

    expect(renderedAlbumNames()).toEqual(['Zebra', 'Mango', 'Apple']);
  });
});
