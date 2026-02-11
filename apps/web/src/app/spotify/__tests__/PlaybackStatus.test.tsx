import { render, screen } from '@testing-library/react';
import { PlaybackStatus } from '../PlaybackStatus';

describe('PlaybackStatus', () => {
  beforeEach(() => {
    // Freeze time for consistent relative time testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows "Now playing" with music icon when actively playing', () => {
    render(<PlaybackStatus isPlaying={true} />);

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
  });

  it('shows "Just played" with music icon when paused', () => {
    render(<PlaybackStatus isPlaying={false} />);

    expect(screen.getByText(/just played/i)).toBeInTheDocument();
  });

  it('shows relative time when played in the past', () => {
    render(<PlaybackStatus playedAt="2026-02-10T09:00:00Z" />);

    expect(screen.getByText(/played 3 hours ago/i)).toBeInTheDocument();
  });

  it('prefers isPlaying over playedAt when both are present', () => {
    render(<PlaybackStatus isPlaying={true} playedAt="2026-02-10T09:00:00Z" />);

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.queryByText(/3 hours ago/i)).not.toBeInTheDocument();
  });
});
