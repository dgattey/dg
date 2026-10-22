import type { StravaRouteTrace, StravaSport } from '@dg/content-models/strava/StravaHistory';
import { RouteAtlasMap } from '@dg/maps/src/RouteAtlasMap';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteCountTag, RouteFilter } from '../RouteFilter';
import { toMapRoutes } from '../stravaSports';

const PRESIDIO = '_yueFn|njVo}@n}@_|BoKn}@_nD~{B~{B';
const LAKE_MERRITT = '_yueFnhfiV_q@wj@f^_q@vj@fw@_Xnd@';

let nextId = 0;
const routesOf = (sport: StravaSport, year: number, count: number): Array<StravaRouteTrace> =>
  Array.from({ length: count }, (_, index) => {
    nextId += 1;
    return { id: nextId, polyline: index % 2 ? LAKE_MERRITT : PRESIDIO, sport, year };
  });

const renderFilter = (routes: ReadonlyArray<StravaRouteTrace>) => {
  const { container } = render(
    <RouteFilter routes={routes} thisYear={2026}>
      <RouteAtlasMap
        bounds={[
          [37.75, -122.5],
          [37.82, -122.24],
        ]}
        label="Routes"
        routes={toMapRoutes(routes)}
        tileSource={{ mode: 'offline' }}
      />
      <RouteCountTag />
    </RouteFilter>,
  );
  const inkedTones = () =>
    [...container.querySelectorAll('path[data-tone]')].map((path) =>
      path.getAttribute('data-tone'),
    );
  return { inkedTones };
};

const routes = [
  ...routesOf('ride', 2025, 30),
  ...routesOf('run', 2025, 12),
  ...routesOf('ride', 2026, 8),
  ...routesOf('other', 2026, 2),
];

describe('RouteFilter', () => {
  it('starts on every route with only the sports that have routes', () => {
    const { inkedTones } = renderFilter(routes);

    expect(screen.getByRole('group', { name: 'Sport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All routes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hikes' })).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['vermilion', 'cobalt', 'ochre']);
    expect(screen.getByText('52 routes')).toBeInTheDocument();
  });

  it('inks one sport when its pill is pressed', async () => {
    const user = userEvent.setup();
    const { inkedTones } = renderFilter(routes);

    await user.click(screen.getByRole('button', { name: 'Rides' }));

    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All routes' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(inkedTones()).toEqual(['vermilion']);
    expect(screen.getByText('38 routes')).toBeInTheDocument();
  });

  it('narrows to this year on top of the sport', async () => {
    const user = userEvent.setup();
    const { inkedTones } = renderFilter(routes);

    await user.click(screen.getByRole('button', { name: 'This year' }));
    expect(inkedTones()).toEqual(['vermilion', 'ochre']);
    expect(screen.getByText('10 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(inkedTones()).toEqual([]);
    expect(screen.getByText('No routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All time' }));
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('12 routes')).toBeInTheDocument();
  });

  it('shows no filters when there is nothing to choose between', () => {
    const { inkedTones } = renderFilter(routesOf('ride', 2026, 1));

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['vermilion']);
    expect(screen.getByText('1 route')).toBeInTheDocument();
  });
});
