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

  it('keeps moving time in the tree but hidden off the greenhouse surface', () => {
    render(
      <ActivityStats
        activity={{
          distance: 29_612,
          id: 123,
          movingTime: 7620,
          name: 'Morning Ride',
          relativeStartDate: '2 days ago',
          startDate: '2026-02-08T12:00:00Z',
          type: 'Ride',
          url: 'https://www.strava.com/activities/123',
        }}
      />,
      { wrapper: TestWrapper },
    );

    const moving = screen.getByText('2h 07m');
    expect(moving).toBeInTheDocument();
    expect(moving).not.toBeVisible();
    expect(screen.getByText('2 days ago')).toBeVisible();
  });

  it('shows distance and moving time inside a greenhouse frame', () => {
    render(
      <div data-greenhouse-frame="">
        <ActivityStats
          activity={{
            distance: 29_612,
            id: 123,
            movingTime: 7620,
            name: 'Morning Ride',
            relativeStartDate: '2 days ago',
            startDate: '2026-02-08T12:00:00Z',
            type: 'Ride',
            url: 'https://www.strava.com/activities/123',
          }}
        />
      </div>,
      { wrapper: TestWrapper },
    );

    expect(screen.getByText('18.4 miles')).toBeVisible();
    expect(screen.getByText('2h 07m')).toBeVisible();
    expect(screen.getByText('2 days ago')).not.toBeVisible();
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
