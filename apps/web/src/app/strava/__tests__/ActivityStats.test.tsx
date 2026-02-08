import { render, screen } from '@testing-library/react';
import { ActivityStats } from '../ActivityStats';

describe('ActivityStats', () => {
  it('renders distance and relative date in the header row', () => {
    render(
      <ActivityStats
        activity={{
          distance: 10_000,
          id: 123,
          name: 'Morning Ride',
          relativeStartDate: '2 days ago',
          type: 'Ride',
          url: 'https://www.strava.com/activities/123',
        }}
      />,
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
          type: 'Yoga',
          url: 'https://www.strava.com/activities/456',
        }}
      />,
    );

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });
});
