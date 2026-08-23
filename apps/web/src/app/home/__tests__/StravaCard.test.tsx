import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

  it('hides the activity name on the greenhouse surface', () => {
    render(
      <div data-greenhouse-frame="">
        <StravaCard
          activity={{
            ...activity,
            description: 'Along the ridge',
            distance: 29_612,
            map: { summaryPolyline: 'summary-route' },
            movingTime: 7620,
          }}
        />
      </div>,
    );

    expect(screen.getByText('Morning run')).not.toBeVisible();
    expect(screen.getByText('Along the ridge')).not.toBeVisible();
    expect(screen.getByTestId('route-map')).toHaveAttribute('data-polyline', 'summary-route');
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

  it('locks the greenhouse card to a stable map aspect so the grid row cannot squash it', () => {
    const source = readFileSync(join(__dirname, '../StravaCard.tsx'), 'utf8');
    expect(source).toContain("'16 / 9'");
    expect(source).toContain("'4 / 3'");
    expect(source).toContain("height: 'auto !important'");
    expect(source).toContain("display: 'grid'");
    expect(source).toContain("position: 'relative'");
  });
});
