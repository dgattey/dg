import type { RouteGroup } from '@dg/maps/bay/bayRoutes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilteredRouteInk, RouteCountTag, RouteFilter } from '../RouteFilter';

const group = (sport: RouteGroup['sport'], year: number, routes: number): RouteGroup => ({
  d: `M${year} ${routes}l1 1`,
  routes,
  sport,
  year,
});

const renderFilter = (groups: ReadonlyArray<RouteGroup>) => {
  const { container } = render(
    <RouteFilter groups={groups} thisYear={2026}>
      <svg aria-label="Routes" role="img">
        <FilteredRouteInk />
      </svg>
      <RouteCountTag />
    </RouteFilter>,
  );
  const inkedSports = () =>
    [...container.querySelectorAll('path')].map((path) => path.getAttribute('data-sport'));
  return { inkedSports };
};

const groups = [
  group('ride', 2025, 30),
  group('run', 2025, 12),
  group('ride', 2026, 8),
  group('other', 2026, 2),
];

describe('RouteFilter', () => {
  it('starts on every route with only the sports that have routes', () => {
    const { inkedSports } = renderFilter(groups);

    expect(screen.getByRole('group', { name: 'Sport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All routes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hikes' })).not.toBeInTheDocument();
    expect(inkedSports()).toEqual(['ride', 'run', 'ride', 'other']);
    expect(screen.getByText('52 routes')).toBeInTheDocument();
  });

  it('inks one sport when its pill is pressed', async () => {
    const user = userEvent.setup();
    const { inkedSports } = renderFilter(groups);

    await user.click(screen.getByRole('button', { name: 'Rides' }));

    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All routes' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(inkedSports()).toEqual(['ride', 'ride']);
    expect(screen.getByText('38 routes')).toBeInTheDocument();
  });

  it('narrows to this year on top of the sport', async () => {
    const user = userEvent.setup();
    const { inkedSports } = renderFilter(groups);

    await user.click(screen.getByRole('button', { name: 'This year' }));
    expect(inkedSports()).toEqual(['ride', 'other']);
    expect(screen.getByText('10 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(inkedSports()).toEqual([]);
    expect(screen.getByText('No routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All time' }));
    expect(inkedSports()).toEqual(['run']);
    expect(screen.getByText('12 routes')).toBeInTheDocument();
  });

  it('shows no filters when there is nothing to choose between', () => {
    const { inkedSports } = renderFilter([group('ride', 2026, 1)]);

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(inkedSports()).toEqual(['ride']);
    expect(screen.getByText('1 route')).toBeInTheDocument();
  });
});
