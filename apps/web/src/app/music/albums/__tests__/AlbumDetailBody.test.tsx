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

/** Matches the fixed gutter `AlbumWell` reserves for hanging track numbers. */
const GUTTER = '1.5rem';

function albumWithTracks(count: number): AlbumDetail {
  const tracks = Array.from({ length: count }, (_, index) => ({
    artists: [{ id: 'artist-1', name: 'Primary Artist', url: 'https://example.com/artist-1' }],
    discNumber: 1,
    durationMs: 120_000,
    id: `filler-${index + 1}`,
    name: `Track ${index + 1}`,
    trackNumber: index + 1,
    url: `https://example.com/track-${index + 1}`,
  }));
  return { ...album, totalTracks: count, tracks };
}

const threeTrackEp = albumWithTracks(3);
const fortyFiveTrackAlbum = albumWithTracks(45);

function byRole(container: HTMLElement, role: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-role="${role}"]`);
  if (!element) {
    throw new Error(`No element with data-role="${role}"`);
  }
  return element;
}

const templateOf = (element: HTMLElement) => getComputedStyle(element).gridTemplateColumns;
const columnsOf = (element: HTMLElement) => getComputedStyle(element).gridColumn;

describe('AlbumDetailBody', () => {
  it('renders numbered tracks and Spotify links for artists and tracks', () => {
    render(<AlbumDetailBody album={album} />);

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

  it('makes complete truncated track text available as native titles', () => {
    render(<AlbumDetailBody album={album} />);

    expect(
      screen.getByTitle('Closer with a title that needs to truncate on narrow screens'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Guest, Another guest with a long name')).toBeInTheDocument();
  });

  it('summarizes the album without naming the label', () => {
    render(<AlbumDetailBody album={album} />);

    expect(screen.getByText(/2019/)).toBeInTheDocument();
    expect(screen.getByText(/2 tracks/)).toBeInTheDocument();
    expect(screen.queryByText(/Example Records/)).not.toBeInTheDocument();
  });

  it('shows popularity as a labelled meter with a spoken value', () => {
    render(<AlbumDetailBody album={album} />);

    const meter = screen.getByRole('img', { name: 'Popularity 55 out of 100' });
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveTextContent('Popularity');
    expect(meter).toHaveTextContent('55');
    expect(screen.queryByText('Popularity 55')).not.toBeInTheDocument();
  });

  it('lands the meta and every track title on one text edge', () => {
    const { container } = render(<AlbumDetailBody album={album} />);

    const meta = byRole(container, 'album-meta');
    const metaBand = meta.parentElement as HTMLElement;

    expect(columnsOf(meta)).toBe('2');
    expect(templateOf(metaBand)).toBe(`${GUTTER} minmax(0, 1fr)`);
    for (const row of container.querySelectorAll<HTMLElement>('[data-role="track-row"]')) {
      expect(templateOf(row)).toBe(`${GUTTER} minmax(0, 1fr) auto`);
    }
  });

  it('keeps the gutter identical for a three-track EP and a long album', () => {
    const { container, unmount } = render(<AlbumDetailBody album={threeTrackEp} />);
    const epGutter = templateOf(byRole(container, 'track-row'));
    unmount();

    const long = render(<AlbumDetailBody album={fortyFiveTrackAlbum} />);

    expect(templateOf(byRole(long.container, 'track-row'))).toBe(epGutter);
  });

  it('keeps the skeleton on the loaded column structure', () => {
    const { container } = render(<AlbumDetailBodySkeleton />);

    expect(templateOf(byRole(container, 'album-meta-skeleton'))).toBe(`${GUTTER} minmax(0, 1fr)`);
    expect(templateOf(byRole(container, 'track-row-skeleton'))).toBe(`${GUTTER} minmax(0, 1fr)`);
  });
});
