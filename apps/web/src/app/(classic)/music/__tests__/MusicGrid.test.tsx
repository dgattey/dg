import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { render, screen } from '@testing-library/react';
import { MusicGrid } from '../MusicGrid';

let playCounter = 0;

function play(album: string, track: string): HistoryTrack {
  playCounter += 1;
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    playedAt: `2026-08-04T12:${String(playCounter).padStart(2, '0')}:00.000Z`,
    trackId: `track-${track}`,
    trackName: track,
    url: `https://open.spotify.com/track/${track}`,
  };
}

const linkNames = () => screen.getAllByRole('link').map((link) => link.getAttribute('aria-label'));

describe('MusicGrid', () => {
  it('renders a repeated album as one stack and single plays as tiles', () => {
    render(
      <MusicGrid
        tracks={[
          play('Bloom', 'One'),
          play('Bloom', 'Two'),
          play('Bloom', 'Three'),
          play('Clay', 'Four'),
        ]}
      />,
    );

    expect(linkNames()).toEqual(['Bloom – Bloom artist, 3 tracks', 'Clay']);
    expect(screen.getByText('3 tracks')).toBeInTheDocument();
  });

  it('fans sleeves only for runs, leaving single plays flat', () => {
    const { container } = render(
      <MusicGrid tracks={[play('Bloom', 'One'), play('Bloom', 'Two'), play('Clay', 'Solo')]} />,
    );

    const covers = [...container.querySelectorAll('a')].map(
      (link) => link.querySelectorAll('img').length,
    );
    expect(covers).toEqual([2, 1]);
  });

  it('sends a stack to the album and a single tile to its track', () => {
    render(
      <MusicGrid tracks={[play('Bloom', 'One'), play('Bloom', 'Two'), play('Clay', 'Solo')]} />,
    );

    expect(screen.getByRole('link', { name: /Bloom/ })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/Bloom',
    );
    expect(screen.getByRole('link', { name: 'Clay' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/Solo',
    );
  });

  it('grows an existing stack when infinite scroll appends more of the same album', () => {
    const firstPage = [play('Bloom', 'One'), play('Bloom', 'Two')];
    const { rerender } = render(<MusicGrid tracks={firstPage} />);

    expect(screen.getByText('2 tracks')).toBeInTheDocument();

    rerender(<MusicGrid tracks={[...firstPage, play('Bloom', 'Three'), play('Clay', 'Four')]} />);

    expect(screen.getByText('3 tracks')).toBeInTheDocument();
    expect(linkNames()).toEqual(['Bloom – Bloom artist, 3 tracks', 'Clay']);
  });

  it('renders nothing for an empty section', () => {
    render(<MusicGrid tracks={[]} />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
