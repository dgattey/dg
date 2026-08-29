/**
 * @jest-environment jsdom
 */

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { render, screen } from '@testing-library/react';
import { StravaCard } from '../StravaCard';

jest.mock('@dg/maps/StravaRouteMap', () => ({
  StravaRouteMap: ({ encodedPolyline, surface }: { encodedPolyline: string; surface?: string }) => (
    <div data-polyline={encodedPolyline} data-surface={surface} data-testid="route-map" />
  ),
}));

jest.mock('../../collage/CollageStravaCard', () => ({
  CollageStravaCard: ({
    activity,
    encodedPolyline,
  }: {
    activity: StravaActivity;
    encodedPolyline?: string;
  }) => (
    <div data-testid="collage-strava">
      <span>{activity.name}</span>
      {encodedPolyline ? <span data-testid="collage-polyline">{encodedPolyline}</span> : null}
    </div>
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

  it('returns null for a missing activity on both surfaces', () => {
    const { container: classic } = render(<StravaCard activity={null} />);
    expect(classic).toBeEmptyDOMElement();

    const { container: collage } = render(<StravaCard activity={null} surface="collage" />);
    expect(collage).toBeEmptyDOMElement();
  });

  it('renders the collage presentation with the preferred polyline', () => {
    render(
      <StravaCard
        activity={{
          ...activity,
          map: { polyline: 'full-route', summaryPolyline: 'summary-route' },
        }}
        surface="collage"
      />,
    );

    expect(screen.getByTestId('collage-strava')).toHaveTextContent('Morning run');
    expect(screen.getByTestId('collage-polyline')).toHaveTextContent('summary-route');
  });
});
