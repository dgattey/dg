import { render, screen } from '@testing-library/react';
import { ActivityStats } from '../ActivityStats';

describe('ActivityStats', () => {
  it('renders distance and relative date in the header row', () => {
    render(
      <ActivityStats
        activity={{
          distance: 10_000,
          relativeStartDate: '2 days ago',
        }}
      />,
    );

    expect(screen.getByText('6.2 miles')).toBeInTheDocument();
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });
});
