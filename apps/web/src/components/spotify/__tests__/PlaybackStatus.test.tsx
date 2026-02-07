import { render, screen } from '@testing-library/react';
import { PlaybackStatus } from '../PlaybackStatus';

describe('PlaybackStatus', () => {
  it('shows "Now playing" with music icon when actively playing', () => {
    render(<PlaybackStatus isPlaying={true} />);

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
  });

  it('shows "Just played" with music icon when paused', () => {
    render(<PlaybackStatus isPlaying={false} />);

    expect(screen.getByText(/just played/i)).toBeInTheDocument();
  });

  it('shows relative time when played in the past', () => {
    render(<PlaybackStatus playedAt="2025-01-01T00:00:00Z" relativePlayedAt="3 hours ago" />);

    expect(screen.getByText(/played 3 hours ago/i)).toBeInTheDocument();
  });

  it('throws when relativePlayedAt is set without playedAt', () => {
    expect(() => render(<PlaybackStatus relativePlayedAt="3 hours ago" />)).toThrow(
      'relativePlayedAt requires playedAt to be set',
    );
  });

  it('prefers isPlaying over playedAt when both are present', () => {
    render(
      <PlaybackStatus
        isPlaying={true}
        playedAt="2025-01-01T00:00:00Z"
        relativePlayedAt="3 hours ago"
      />,
    );

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.queryByText(/3 hours ago/i)).not.toBeInTheDocument();
  });
});
