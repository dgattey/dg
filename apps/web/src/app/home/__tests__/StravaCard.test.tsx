import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { render, screen } from '@testing-library/react';
import { StravaCard } from '../StravaCard';

jest.mock('@dg/maps/StravaRouteMap', () => ({
  StravaRouteMap: ({ encodedPolyline }: { encodedPolyline: string }) => (
    <div data-polyline={encodedPolyline} data-testid="route-map" />
  ),
}));

const activity: StravaActivity = {
  id: 123,
  name: 'Morning run',
  type: 'Run',
  url: 'https://www.strava.com/activities/123',
};

describe('StravaCard', () => {
  it('omits the route map when the activity has no route', () => {
    render(<StravaCard activity={{ ...activity, map: null }} />);

    expect(screen.getByRole('link', { name: 'Morning run on Strava' })).toBeInTheDocument();
    expect(screen.queryByTestId('route-map')).not.toBeInTheDocument();
  });

  it('links the whole card to the activity, with no nested links', () => {
    render(<StravaCard activity={{ ...activity, description: 'Hills', map: null }} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Morning run on Strava');
    expect(links[0]).toHaveAttribute('href', activity.url);
    expect(links[0]).toHaveTextContent('Hills');
  });

  it('prefers the summary polyline for the background route', () => {
    render(
      <StravaCard
        activity={{
          ...activity,
          map: { polyline: 'full-route', summaryPolyline: 'summary-route' },
        }}
      />,
    );

    expect(screen.getByTestId('route-map')).toHaveAttribute('data-polyline', 'summary-route');
  });
});
