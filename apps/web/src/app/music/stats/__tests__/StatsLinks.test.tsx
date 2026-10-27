import type { StatsAlbumRef } from '@dg/services/spotify/fetchListeningStats';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { albumDetailFor } from '../../albums/albumDetailCache';
import { AlbumLink } from '../StatsLinks';

jest.mock('../../albums/albumDetailCache', () => ({
  albumDetailFor: jest.fn(),
}));

const album = (id: string, isFavorite: boolean): StatsAlbumRef => ({
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  isFavorite,
  name: `Album ${id}`,
  url: `https://open.spotify.com/album/${id}`,
});

describe('AlbumLink', () => {
  beforeEach(() => {
    jest.mocked(albumDetailFor).mockReset();
  });

  it('starts loading a favorite album on hover and on focus', async () => {
    const user = userEvent.setup();
    render(<AlbumLink album={album('apart', true)}>Apart</AlbumLink>);
    const link = screen.getByRole('link', { name: 'Album apart' });

    await user.hover(link);
    expect(jest.mocked(albumDetailFor).mock.calls).toEqual([['apart']]);

    act(() => {
      link.focus();
    });
    expect(jest.mocked(albumDetailFor).mock.calls).toEqual([['apart'], ['apart']]);
  });

  it('loads nothing for an album that opens on Spotify', async () => {
    const user = userEvent.setup();
    render(<AlbumLink album={album('rush', false)}>Rush</AlbumLink>);

    await user.hover(screen.getByRole('link'));

    expect(albumDetailFor).not.toHaveBeenCalled();
  });
});
