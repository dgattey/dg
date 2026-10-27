import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { render, screen } from '@testing-library/react';
import { AlbumDetailBody } from '../AlbumDetailBody';
import { AlbumDetailBodySkeleton } from '../AlbumDetailBodySkeleton';

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
        {
          id: 'artist-3',
          name: 'Another guest with a long name',
          url: 'https://open.spotify.com/artist/artist-3',
        },
      ],
      discNumber: 1,
      durationMs: 180_000,
      id: 'track-2',
      name: 'Closer with a title that needs to truncate on narrow screens',
      trackNumber: 2,
      url: 'https://open.spotify.com/track/track-2',
    },
  ],
  url: 'https://open.spotify.com/album/album-1',
};

function byRole(container: HTMLElement, role: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-role="${role}"]`);
  if (!element) {
    throw new Error(`No element with data-role="${role}"`);
  }
  return element;
}

describe('AlbumDetailBody', () => {
  it('renders numbered tracks and Spotify links for artists and tracks', () => {
    render(<AlbumDetailBody album={album} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Open Primary Artist on Spotify' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Open Primary Artist on Spotify' })[0],
    ).toHaveAttribute('href', 'https://open.spotify.com/artist/artist-1');
    expect(screen.getByRole('link', { name: 'Open Opening on Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/track-1',
    );
    expect(
      screen.getByRole('link', {
        name: 'Open Closer with a title that needs to truncate on narrow screens on Spotify',
      }),
    ).toHaveAttribute('href', 'https://open.spotify.com/track/track-2');
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('puts complete truncated track text in tooltips', () => {
    render(<AlbumDetailBody album={album} />);

    const tooltips = screen
      .getAllByRole('tooltip', { hidden: true })
      .map((tooltip) => tooltip.textContent);
    expect(tooltips).toEqual(
      expect.arrayContaining([
        'Primary Artist',
        'Closer with a title that needs to truncate on narrow screens',
        'Guest, Another guest with a long name',
      ]),
    );
  });

  it('summarizes the album without naming the label', () => {
    render(<AlbumDetailBody album={album} />);

    expect(screen.getByText(/2019/)).toBeInTheDocument();
    expect(screen.getByText(/2 tracks/)).toBeInTheDocument();
    expect(screen.queryByText(/Example Records/)).not.toBeInTheDocument();
  });

  it('keeps the skeleton on the loaded column structure', () => {
    const { container } = render(<AlbumDetailBodySkeleton />);

    expect(byRole(container, 'track-row-skeleton')).toHaveClass(
      'music__wellTrack',
      'music__wellTrackSkeleton',
    );
  });
});
