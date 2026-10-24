import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StravaAtlas } from '../FilteredSections';
import { RouteCountTag, StravaFilters } from '../StravaFilters';

const NOW = Date.parse('2026-10-22T15:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

const PRESIDIO = '_yueFn|njVo}@n}@_|BoKn}@_nD~{B~{B';
const LAKE_MERRITT = '_yueFnhfiV_q@wj@f^_q@vj@fw@_Xnd@';

let nextId = 0;
const outingsOf = (sport: StravaSport, daysAgo: number, count: number): Array<StravaLogEntry> =>
  Array.from({ length: count }, (_, index) => {
    nextId += 1;
    return {
      distanceMeters: 10_000,
      elevationGainMeters: 100,
      id: nextId,
      movingTimeSeconds: 1_800,
      name: `Outing ${nextId}`,
      polyline: index % 2 ? LAKE_MERRITT : PRESIDIO,
      sport,
      startDate: new Date(NOW - daysAgo * DAY_MS).toISOString(),
      url: `https://www.strava.com/activities/${nextId}`,
    };
  });

const renderFilters = (outings: ReadonlyArray<StravaLogEntry>) => {
  const { container } = render(
    <StravaFilters outings={outings}>
      <StravaAtlas
        bounds={[
          [37.75, -122.5],
          [37.82, -122.24],
        ]}
        tileSource={{ mode: 'offline' }}
      />
      <RouteCountTag />
    </StravaFilters>,
  );
  const inkedTones = () =>
    [...container.querySelectorAll('path[data-tone]')].map((path) =>
      path.getAttribute('data-tone'),
    );
  return { inkedTones };
};

const outings = [
  ...outingsOf('ride', 3, 8),
  ...outingsOf('other', 20, 2),
  ...outingsOf('run', 400, 12),
  ...outingsOf('ride', 400, 30),
];

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StravaFilters', () => {
  it('starts on every route with only the sports that have routes', () => {
    const { inkedTones } = renderFilters(outings);

    expect(screen.getByRole('button', { name: 'All routes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All time' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hikes' })).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['cobalt', 'ochre', 'vermilion']);
    expect(screen.getByText('52 routes')).toBeInTheDocument();
  });

  it('inks one sport when its pill is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(screen.getByRole('button', { name: 'Rides' }));

    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'true');
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('38 routes')).toBeInTheDocument();
  });

  it('narrows to a rolling window or a year on top of the sport', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('8 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'This month' }));
    expect(inkedTones()).toEqual(['cobalt', 'ochre']);
    expect(screen.getByText('10 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(inkedTones()).toEqual([]);
    expect(screen.getByText('No routes')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '2025');
    expect(screen.getByRole('button', { name: 'This month' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(inkedTones()).toEqual(['vermilion']);
    expect(screen.getByText('12 routes')).toBeInTheDocument();
  });

  it('offers every year with an outing, newest first', () => {
    renderFilters(outings);

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Year',
      '2026',
      '2025',
    ]);
  });

  it('shows no sport pills or year picker when there is nothing to choose between', () => {
    const { inkedTones } = renderFilters(outingsOf('ride', 1, 1));

    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Year' })).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('1 route')).toBeInTheDocument();
  });
});
