import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen } from '@testing-library/react';
import { AlbumWell } from '../AlbumWell';

const album: PlaylistAlbum = {
  addedAt: '2024-01-02T03:04:05Z',
  artistNames: 'Primary Artist, Guest',
  id: 'album-1',
  imageUrl: 'https://i.scdn.co/image/album-1',
  name: 'Example Album',
  primaryArtist: 'Primary Artist',
  releaseDate: '2019-04-12',
  url: 'https://open.spotify.com/album/album-1',
};

describe('AlbumWell', () => {
  it('renders art and title linking to the album on Spotify', () => {
    render(<AlbumWell album={album} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Example Album' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Example Album' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
    expect(screen.getByRole('link', { name: 'Open Example Album on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
  });

  it('renders the loaded detail inside the well', () => {
    render(
      <AlbumWell album={album}>
        <p>loaded tracklist</p>
      </AlbumWell>,
    );

    expect(screen.getByText('loaded tracklist')).toBeInTheDocument();
  });

  it('adds no stickers of its own, so opening never pops new ones in', () => {
    const { container } = render(
      <AlbumWell album={album}>
        <p>loaded tracklist</p>
      </AlbumWell>,
    );

    expect(container.querySelector('[data-cut-out]')).not.toBeInTheDocument();
    expect(container.querySelector('.collageBackdrop')).not.toBeInTheDocument();
  });
});
