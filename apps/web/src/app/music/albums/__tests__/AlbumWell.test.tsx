import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { render, screen } from '@testing-library/react';
import { AlbumWell, TRACK_NUMBER_COLUMN } from '../AlbumWell';

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

    expect(screen.getByRole('heading', { name: 'Example Album' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Example Album' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
    expect(screen.getByRole('link', { name: 'Open Example Album on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/album-1',
    );
  });

  it('renders streamed detail inside the well', () => {
    render(
      <AlbumWell album={album}>
        <p>streamed tracklist</p>
      </AlbumWell>,
    );

    expect(screen.getByText('streamed tracklist')).toBeInTheDocument();
  });

  it('starts the album name on the same text edge the tracklist uses', () => {
    render(<AlbumWell album={album} />);

    const name = screen.getByRole('heading', { name: 'Example Album' });

    expect(getComputedStyle(name).gridTemplateColumns).toBe(
      `${TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
    );
    expect(getComputedStyle(screen.getByRole('link', { name: 'Example Album' })).gridColumn).toBe(
      '2',
    );
  });

  it('reserves a gutter that no streamed track count can change', () => {
    expect(TRACK_NUMBER_COLUMN).toBe('1.5rem');
  });
});
