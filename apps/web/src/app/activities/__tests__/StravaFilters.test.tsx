import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import type { AtlasRegion } from '@dg/maps/atlasGeometry';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StravaAtlas } from '../FilteredSections';
import { RouteCountTag, StravaFilters } from '../StravaFilters';
import { getDesktopButton } from './stravaFilterQueries';

/** The pills in a group, leaving out the phone menu that repeats the ones that fold away. */
const pillsIn = (group: HTMLElement) =>
  within(group)
    .getAllByRole('button')
    .filter((button) => !button.closest('.pillMenu'));

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
  it('starts on rides, with only the sports that have routes in ride, ski, hike, run order and all sports last', () => {
    const { inkedTones } = renderFilters(outings);

    expect(getDesktopButton('Rides')).toHaveAttribute('aria-pressed', 'true');
    expect(getDesktopButton('All time')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Hikes' })).not.toBeInTheDocument();
    expect(
      pillsIn(screen.getByRole('group', { name: 'Sport' })).map((button) => button.textContent),
    ).toEqual(['Rides', 'Skiing', 'Runs', 'All sports']);
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('38 routes')).toBeInTheDocument();
  });

  it('folds the sports past the first two into a More menu that names the one picked from it', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);
    const moreSports = screen.getByRole('list', { name: 'More sports' });

    expect(
      within(moreSports)
        .getAllByRole('button')
        .map((option) => option.textContent),
    ).toEqual(['Runs', 'All sports']);
    expect(screen.getByText('More')).toBeInTheDocument();

    await user.click(within(moreSports).getByRole('button', { name: 'Runs' }));
    expect(screen.queryByText('More')).not.toBeInTheDocument();
    expect(getDesktopButton('Runs')).toHaveAttribute('aria-pressed', 'true');
    expect(inkedTones()).toEqual(['vermilion']);
  });

  it('names the picked span on the phone time menu', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderFilters(outings);
    const spanMenu = screen.getByRole('list', { name: 'Time span' });

    await user.click(within(spanMenu).getByRole('button', { name: 'This week' }));
    expect(getDesktopButton('This week')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  it('inks every type, or skiing alone in its own color', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(getDesktopButton('All sports'));
    expect(inkedTones()).toEqual(['cobalt', 'ochre', 'vermilion', 'rose']);
    expect(screen.getByText('54 routes')).toBeInTheDocument();

    await user.click(getDesktopButton('Skiing'));
    expect(getDesktopButton('Skiing')).toHaveAttribute('aria-pressed', 'true');
    expect(inkedTones()).toEqual(['rose']);
    expect(screen.getByText('2 routes')).toBeInTheDocument();
  });

  it('zooms from Bay Area to San Diego and back from the region strip', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedPaths } = renderFilters(outings, [
      { bounds: BAY_AREA, key: 'sf', label: 'Bay Area' },
      { bounds: SAN_DIEGO, key: 'sd', label: 'San Diego' },
    ]);
    const strip = screen.getByRole('group', { name: 'Zoom to region' });
    const bayArea = within(strip).getByRole('button', { name: 'Bay Area' });
    const sanDiego = within(strip).getByRole('button', { name: 'San Diego' });
    const bayAreaPaths = inkedPaths();

    expect(strip).toHaveClass('chrome__strip');
    expect(bayArea).toHaveAttribute('aria-pressed', 'true');
    expect(bayArea).toHaveClass('chrome__segmentCurrent');

    await user.click(sanDiego);
    expect(sanDiego).toHaveAttribute('aria-pressed', 'true');
    expect(sanDiego).toHaveClass('chrome__segmentCurrent');
    expect(bayArea).toHaveAttribute('aria-pressed', 'false');
    expect(bayArea).not.toHaveClass('chrome__segmentCurrent');
    expect(inkedPaths()).not.toEqual(bayAreaPaths);

    await user.click(bayArea);
    expect(bayArea).toHaveAttribute('aria-pressed', 'true');
    expect(bayArea).toHaveClass('chrome__segmentCurrent');
    expect(sanDiego).toHaveAttribute('aria-pressed', 'false');
    expect(inkedPaths()).toEqual(bayAreaPaths);
  });

  it('narrows to a rolling window or a year on top of the sport', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { inkedTones } = renderFilters(outings);

    await user.click(getDesktopButton('All sports'));
    await user.click(getDesktopButton('This week'));
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('8 routes')).toBeInTheDocument();

    await user.click(getDesktopButton('This month'));
    expect(inkedTones()).toEqual(['cobalt', 'ochre']);
    expect(screen.getByText('10 routes')).toBeInTheDocument();

    await user.click(getDesktopButton('Runs'));
    expect(inkedTones()).toEqual([]);
    expect(screen.getByText('No routes')).toBeInTheDocument();

    await user.click(screen.getByText('Year'));
    await user.click(getDesktopButton('2025', false));
    expect(getDesktopButton('This month')).toHaveAttribute('aria-pressed', 'false');
    expect(inkedTones()).toEqual(['vermilion']);
    expect(screen.getByText('12 routes')).toBeInTheDocument();
  });

  it('offers every year with an outing, newest first', () => {
    renderFilters(outings);

    for (const yearGrid of screen.getAllByRole('list', { name: 'Select year' })) {
      expect(
        within(yearGrid)
          .getAllByRole('button')
          .map((option) => option.textContent),
      ).toEqual(['2026', '2025']);
    }
  });

  it('shows no sport pills or year picker when there is nothing to choose between', () => {
    const { inkedTones } = renderFilters(outingsOf('ride', 1, 1));

    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
    expect(inkedTones()).toEqual(['cobalt']);
    expect(screen.getByText('1 route')).toBeInTheDocument();
  });

  it('keeps the year menu in the time span group', () => {
    renderFilters(outings);

    expect(
      within(screen.getByRole('group', { name: 'Time span' })).getByText('Year'),
    ).toBeInTheDocument();
  });
});
