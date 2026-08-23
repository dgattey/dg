import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import { ListeningHistoryCard } from '../ListeningHistoryCard';

jest.mock('../../../../services/music.actions', () => ({
  loadMoreMusicHistory: jest.fn(),
}));

const TEST_SERVER_TIME = Date.parse('2026-08-04T18:00:00.000Z');

function play(album: string, track: string): HistoryTrack {
  return {
    albumId: `album-${album}`,
    albumImageUrl: `https://i.scdn.co/image/${album}`,
    albumName: album,
    albumUrl: `https://open.spotify.com/album/${album}`,
    artistNames: `${album} artist`,
    playedAt: '2026-08-04T12:00:00.000Z',
    trackId: `track-${track}`,
    trackName: track,
    url: `https://open.spotify.com/track/${track}`,
  };
}

describe('ListeningHistoryCard', () => {
  it('shows the flag-off empty copy on glass when history is empty', () => {
    render(<ListeningHistoryCard initialCursor={null} initialTracks={[]} />);

    expect(screen.getByRole('heading', { name: 'Listening history' })).toBeInTheDocument();
    expect(screen.getByText('No listening history yet.')).toBeInTheDocument();
    expect(document.querySelector('[data-listening-history]')).toHaveAttribute(
      'data-greenhouse-cell',
      'history',
    );
  });

  it('renders date-grouped album tiles from the same history page', () => {
    render(
      <ServerTimeProvider serverTime={TEST_SERVER_TIME}>
        <ListeningHistoryCard
          initialCursor={null}
          initialTracks={[play('Bloom', 'One'), play('Bloom', 'Two'), play('Clay', 'Four')]}
        />
      </ServerTimeProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Listening history' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bloom – Bloom artist, 2 tracks' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/Bloom',
    );
    expect(screen.getByRole('link', { name: 'Clay' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/Four',
    );
  });
});
