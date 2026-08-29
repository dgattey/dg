/**
 * @jest-environment jsdom
 */

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { render, screen } from '@testing-library/react';
import { CollageStravaCard } from '../CollageStravaCard';

jest.mock('@dg/maps/StravaRouteMap', () => ({
  StravaRouteMap: ({ encodedPolyline, surface }: { encodedPolyline: string; surface?: string }) => (
    <div data-polyline={encodedPolyline} data-surface={surface} data-testid="route-map" />
  ),
}));

jest.mock('../../strava/ActivityStats', () => ({
  ActivityStats: ({ activity }: { activity: StravaActivity }) => (
    <div data-testid="stats">{activity.name}-stats</div>
  ),
}));

jest.mock('../../strava/ActivityTypeWithIcon', () => ({
  ActivityTypeWithIcon: ({ activity }: { activity: StravaActivity }) => (
    <div data-testid="type">{activity.type}</div>
  ),
}));

jest.mock('../../strava/ActivityName', () => ({
  ActivityName: ({ activity }: { activity: StravaActivity }) => (
    <a href={activity.url}>{activity.name}</a>
  ),
}));

jest.mock('../../strava/ActivityDescription', () => ({
  ActivityDescription: ({ activity }: { activity: StravaActivity }) =>
    activity.description ? <p>{activity.description}</p> : null,
}));

jest.mock('../PaperCard', () => ({
  PaperCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const activity: StravaActivity = {
  description: 'Foggy hills',
  id: 123,
  name: 'Morning run',
  type: 'Run',
  url: 'https://www.strava.com/activities/123',
};

describe('CollageStravaCard', () => {
  it('renders stats, type, name, description, and collage map surface', () => {
    const { container } = render(
      <CollageStravaCard activity={activity} encodedPolyline="summary-route" />,
    );

    expect(container.querySelector('[data-work-slot="st"]')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toHaveTextContent('Morning run-stats');
    expect(screen.getByTestId('type')).toHaveTextContent('Run');
    expect(screen.getByRole('link', { name: 'Morning run' })).toHaveAttribute(
      'href',
      'https://www.strava.com/activities/123',
    );
    expect(screen.getByText('Foggy hills')).toBeInTheDocument();
    expect(screen.getByTestId('route-map')).toHaveAttribute('data-polyline', 'summary-route');
    expect(screen.getByTestId('route-map')).toHaveAttribute('data-surface', 'collage');
  });

  it('omits the route when there is no polyline', () => {
    render(<CollageStravaCard activity={activity} />);

    expect(screen.queryByTestId('route-map')).not.toBeInTheDocument();
  });
});
