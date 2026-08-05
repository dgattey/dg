import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { render, screen } from '@testing-library/react';
import { AlbumWell } from '../AlbumWell';

const album: AlbumDetail = {
  artists: [
    {
      id: 'artist-1',
      name: 'Primary Artist',
      url: 'https://open.spotify.com/artist/artist-1',
    },
  ],
  durationMs: 300_000,
  id: 'album-1',
  imageUrl: 'https://i.scdn.co/image/album-1',
  label: 'Example Records',
  name: 'Example Album',
  popularity: 55,
  releaseDate: '2019-04-12',
  totalTracks: 2,
  tracks: [
    {
      artists: [
        {
          id: 'artist-1',
          name: 'Primary Artist',
          url: 'https://open.spotify.com/artist/artist-1',
        },
      ],
      discNumber: 1,
      durationMs: 120_000,
      id: 'track-1',
      name: 'Opening',
      trackNumber: 1,
      url: 'https://open.spotify.com/track/track-1',
    },
    {
      artists: [
        {
          id: 'artist-2',
          name: 'Guest',
          url: 'https://open.spotify.com/artist/artist-2',
        },
      ],
      discNumber: 1,
      durationMs: 180_000,
      id: 'track-2',
      name: 'Closer',
      trackNumber: 2,
      url: 'https://open.spotify.com/track/track-2',
    },
  ],
  url: 'https://open.spotify.com/album/album-1',
};

describe('AlbumWell', () => {
  it('renders numbered tracks and Spotify links for album, artists, and tracks', () => {
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
    expect(
      screen.getAllByRole('link', { name: 'Open Primary Artist on Spotify' })[0],
    ).toHaveAttribute('href', 'https://open.spotify.com/artist/artist-1');
    expect(screen.getByRole('link', { name: 'Open Opening on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/track-1',
    );
    expect(screen.getByRole('link', { name: 'Open Closer on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/track-2',
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/2019/)).toBeInTheDocument();
    expect(screen.getByText(/2 tracks/)).toBeInTheDocument();
  });
});
