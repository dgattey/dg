import { render, screen } from '@testing-library/react';
import { ActivityTypeWithIcon } from '../ActivityTypeWithIcon';

const baseActivity = {
  id: 123,
  name: 'Test Activity',
  url: 'https://www.strava.com/activities/123',
};

describe('ActivityTypeWithIcon', () => {
  it('renders Hike with mountain icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'Hike' }} />);
    expect(screen.getByText(/Latest Hike/)).toBeInTheDocument();
  });

  it('renders Run with footprints icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'Run' }} />);
    expect(screen.getByText(/Latest Run/)).toBeInTheDocument();
  });

  it('renders Ride with bike icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'Ride' }} />);
    expect(screen.getByText(/Latest Ride/)).toBeInTheDocument();
  });

  it('renders WeightTraining with dumbbell icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'WeightTraining' }} />);
    expect(screen.getByText(/Latest Weight Training/)).toBeInTheDocument();
  });

  it('returns null when activity has no type', () => {
    const { container } = render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: '' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders AlpineSki with snow icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'AlpineSki' }} />);
    expect(screen.getByText(/Latest Alpine Ski/)).toBeInTheDocument();
  });

  it('renders Snowboard with snow icon', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'Snowboard' }} />);
    expect(screen.getByText(/Latest Snowboard/)).toBeInTheDocument();
  });

  it('uses generic icon for unknown activity types', () => {
    render(<ActivityTypeWithIcon activity={{ ...baseActivity, type: 'Canoeing' }} />);
    expect(screen.getByText(/Latest Canoeing/)).toBeInTheDocument();
  });
});
