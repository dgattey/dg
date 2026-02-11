import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ActivityStats } from '../ActivityStats';

const TEST_SERVER_TIME = new Date('2026-02-10T12:00:00Z').getTime();

function TestWrapper({ children }: { children: ReactNode }) {
  return <ServerTimeProvider serverTime={TEST_SERVER_TIME}>{children}</ServerTimeProvider>;
}

describe('ActivityStats', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(TEST_SERVER_TIME));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders distance and relative date in the header row', () => {
    render(
      <ActivityStats
        activity={{
          distance: 10_000,
          id: 123,
          name: 'Morning Ride',
          relativeStartDate: '2 days ago',
          startDate: '2026-02-08T12:00:00Z',
          type: 'Ride',
          url: 'https://www.strava.com/activities/123',
        }}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText('6.2 miles')).toBeInTheDocument();
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('renders relative date without distance', () => {
    render(
      <ActivityStats
        activity={{
          id: 456,
          name: 'Morning Yoga',
          relativeStartDate: 'Yesterday',
          startDate: '2026-02-09T06:00:00Z', // ~30 hours ago, clearly "yesterday"
          type: 'Yoga',
          url: 'https://www.strava.com/activities/456',
        }}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });
});
