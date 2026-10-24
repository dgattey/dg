import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import type { AtlasRegion } from '@dg/maps/atlasGeometry';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StravaAtlas } from '../FilteredSections';
import { RouteCountTag, StravaFilters } from '../StravaFilters';

const stravaCss = readFileSync(join(__dirname, '..', 'strava.css'), 'utf8');

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

const BAY_AREA: GeoBounds = [
  [37.75, -122.5],
  [37.82, -122.24],
];

const SAN_DIEGO: GeoBounds = [
  [32.7, -117.25],
  [32.8, -117.1],
];

const renderFilters = (
  outings: ReadonlyArray<StravaLogEntry>,
  regions: ReadonlyArray<AtlasRegion> = [],
) => {
  const { container } = render(
    <StravaFilters outings={outings}>
      <StravaAtlas bounds={BAY_AREA} regions={regions} tileSource={{ mode: 'offline' }} />
      <RouteCountTag />
    </StravaFilters>,
  );
  const inkedTones = () =>
    [...container.querySelectorAll('path[data-tone]')].map((path) =>
      path.getAttribute('data-tone'),
    );
  const inkedPaths = () =>
    [...container.querySelectorAll('path[data-tone]')].map((path) => path.getAttribute('d'));
  return { inkedPaths, inkedTones };
};

const outings = [
  ...outingsOf('ride', 3, 8),
  ...outingsOf('other', 20, 2),
  ...outingsOf('run', 400, 12),
  ...outingsOf('ride', 400, 30),
  ...outingsOf('ski', 300, 2),
];

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StravaFilters', () => {
  it('starts on rides, with only the sports that have routes and all sports last', () => {
    const { inkedTones } = renderFilters(outings);

    expect(screen.getByRole('button', { name: 'Rides' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All time' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('button', { name: 'Hikes' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Sport' }).textContent).toBe(
      'RidesRunsSkiingAll sports',
    );
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('38 routes')).toBeInTheDocument();
  });

  it('inks every type, or skiing alone in its own color', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(screen.getByRole('button', { name: 'All sports' }));
    expect(inkedTones()).toEqual(['cobalt', 'ochre', 'vermilion', 'rose']);
    expect(screen.getByText('54 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Skiing' }));
    expect(screen.getByRole('button', { name: 'Skiing' })).toHaveAttribute('aria-pressed', 'true');
    expect(inkedTones()).toEqual(['rose']);
    expect(screen.getByText('2 routes')).toBeInTheDocument();
  });

  it('flies to a home region and back when its pill is pressed again', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedPaths } = renderFilters(outings, [
      { bounds: BAY_AREA, key: 'bay-area', label: 'Bay Area' },
      { bounds: SAN_DIEGO, key: 'san-diego', label: 'San Diego' },
    ]);
    const overview = inkedPaths();
    const sanDiego = screen.getByRole('button', { name: 'San Diego' });
    expect(screen.getByRole('group', { name: 'Zoom to region' })).toBeInTheDocument();

    await user.click(sanDiego);
    expect(sanDiego).toHaveAttribute('aria-pressed', 'true');
    expect(inkedPaths()).not.toEqual(overview);

    await user.click(sanDiego);
    expect(sanDiego).toHaveAttribute('aria-pressed', 'false');
    expect(inkedPaths()).toEqual(overview);
  });

  it('narrows to a rolling window or a year on top of the sport', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(screen.getByRole('button', { name: 'All sports' }));
    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('8 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'This month' }));
    expect(inkedTones()).toEqual(['cobalt', 'ochre']);
    expect(screen.getByText('10 routes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(inkedTones()).toEqual([]);
    expect(screen.getByText('No routes')).toBeInTheDocument();

    await user.click(screen.getByText('Year'));
    await user.click(screen.getByRole('button', { name: '2025', pressed: false }));
    expect(screen.getByRole('button', { name: 'This month' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(inkedTones()).toEqual(['vermilion']);
    expect(screen.getByText('12 routes')).toBeInTheDocument();
  });

  it('offers every year with an outing, newest first', () => {
    renderFilters(outings);

    expect(
      within(screen.getByRole('list', { name: 'Select year' }))
        .getAllByRole('button')
        .map((option) => option.textContent),
    ).toEqual(['2026', '2025']);
  });

  it('shows no sport pills or year picker when there is nothing to choose between', () => {
    const { inkedTones } = renderFilters(outingsOf('ride', 1, 1));

    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('1 route')).toBeInTheDocument();
  });

  it('holds each pill set to one line, then splits phone rows so no pill sits alone', () => {
    const phone = stravaCss.match(/@media \(max-width: 680px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

    expect(stravaCss).toMatch(/\.strava__filters > \.paperPills \{\s*flex-wrap: nowrap;/);
    expect(phone).toContain('grid-template-columns: repeat(6, minmax(0, 1fr));');
    expect(phone).toContain('.strava__filters > .paperPills > :nth-child(4):nth-last-child(2)');
    expect(phone).toContain('.strava__filters > .paperPills > :first-child:nth-last-child(4) ~ *');
  });

  it('keeps the year menu in the time span group', () => {
    renderFilters(outings);

    expect(
      within(screen.getByRole('group', { name: 'Time span' })).getByText('Year'),
    ).toBeInTheDocument();
  });
});
