/**
 * @jest-environment jsdom
 */

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
  it('keeps the standard card treatment when the activity has no route', () => {
    render(<StravaCard activity={{ ...activity, map: null }} />);

    expect(screen.getByRole('link', { name: 'Morning run' })).toBeInTheDocument();
    expect(screen.queryByTestId('route-map')).not.toBeInTheDocument();
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
