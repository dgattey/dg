import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PlaybackStatus } from '../PlaybackStatus';

const TEST_SERVER_TIME = new Date('2026-02-10T12:00:00Z').getTime();

function TestWrapper({ children }: { children: ReactNode }) {
  return <ServerTimeProvider serverTime={TEST_SERVER_TIME}>{children}</ServerTimeProvider>;
}

describe('PlaybackStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(TEST_SERVER_TIME));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows "Now playing" with music icon when actively playing', () => {
    render(<PlaybackStatus isPlaying={true} />, { wrapper: TestWrapper });

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
  });

  it('shows "Just played" with music icon when paused', () => {
    render(<PlaybackStatus isPlaying={false} />, { wrapper: TestWrapper });

    expect(screen.getByText(/just played/i)).toBeInTheDocument();
  });

  it('shows relative time when played in the past', () => {
    render(<PlaybackStatus playedAt="2026-02-10T09:00:00Z" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText(/played/i)).toBeInTheDocument();
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it.each([
    ['2026-02-10T10:50:00Z', 'Played an hour ago'],
    ['2026-02-09T09:00:00Z', 'Played yesterday'],
  ])('keeps the relative time lowercase mid-sentence (%s)', (playedAt, sentence) => {
    const { container } = render(<PlaybackStatus playedAt={playedAt} />, {
      wrapper: TestWrapper,
    });

    expect(container).toHaveTextContent(sentence);
  });

  it('shows the same wording on the card and the compact pill', () => {
    const playedAt = '2026-02-10T09:00:00Z';
    const { container: card } = render(
      <PlaybackStatus listingVariant="card" playedAt={playedAt} />,
      { wrapper: TestWrapper },
    );
    const { container: compact } = render(
      <PlaybackStatus listingVariant="compact" playedAt={playedAt} />,
      { wrapper: TestWrapper },
    );

    expect(card).toHaveTextContent('Played 3 hours ago');
    expect(compact).toHaveTextContent('Played 3 hours ago');
  });

  it('prefers isPlaying over playedAt when both are present', () => {
    render(<PlaybackStatus isPlaying={true} playedAt="2026-02-10T09:00:00Z" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.queryByText(/3 hours ago/i)).not.toBeInTheDocument();
  });
});
