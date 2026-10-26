import type {
  StravaHistory,
  StravaLogEntry,
  StravaOuting,
} from '@dg/content-models/strava/StravaHistory';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PAPER_TONES } from '../../collage/types';
import { StravaHistorySections } from '../StravaHistorySections';
import { getDesktopButton } from './stravaFilterQueries';

const NOW = Date.parse('2026-10-22T15:00:00Z');

const PRESIDIO = '_yueFn|njVo}@n}@_|BoKn}@_nD~{B~{B';
const LAKE_MERRITT = '_yueFnhfiV_q@wj@f^_q@vj@fw@_Xnd@';
const TAHOE = 'owqmFnjr{Uo}@o}@o}@~{B';

const outing = (id: number, overrides: Partial<StravaLogEntry>): StravaLogEntry => ({
  distanceMeters: 16_093,
  elevationGainMeters: 120,
  id,
  movingTimeSeconds: 3_600,
  name: `Outing ${id}`,
  polyline: null,
  sport: 'ride',
  startDate: '2026-10-01T15:00:00Z',
  url: `https://www.strava.com/activities/${id}`,
  ...overrides,
});

const presidio = outing(1, {
  name: 'Presidio loop',
  polyline: PRESIDIO,
  startDate: '2026-10-20T15:00:00Z',
});
const latest: StravaOuting = { ...presidio, description: 'Fog burned off by the bridge.' };
const merritt = outing(2, {
  name: 'Lake Merritt run',
  polyline: LAKE_MERRITT,
  sport: 'run',
  startDate: '2026-10-18T15:00:00Z',
});
const tahoe = outing(3, {
  distanceMeters: 80_467,
  elevationGainMeters: 1_400,
  movingTimeSeconds: 19_800,
  name: 'Tahoe rim hike',
  polyline: TAHOE,
  sport: 'hike',
  startDate: '2025-07-04T15:00:00Z',
});
const century = outing(4, {
  distanceMeters: 60_000,
  elevationGainMeters: 500,
  name: 'Marin century',
  startDate: '2024-05-11T15:00:00Z',
});

const full: StravaHistory = {
  bikes: [
    {
      elevationGainMeters: 125_578,
      id: 'b1',
      longest: {
        distanceMeters: 190_000,
        name: 'Oysters and garlic bread',
        startDate: '2024-05-19T16:00:00Z',
        url: 'https://www.strava.com/activities/40',
      },
      movingTimeSeconds: 1_368_000,
      name: 'Cruz',
      odometerMeters: 9_086_356,
      rides: 399,
      years: [
        {
          distanceMeters: 2_000_000,
          elevationGainMeters: 25_000,
          movingTimeSeconds: 300_000,
          rides: 80,
          year: 2023,
        },
        {
          distanceMeters: 3_000_000,
          elevationGainMeters: 45_000,
          movingTimeSeconds: 450_000,
          rides: 140,
          year: 2024,
        },
        {
          distanceMeters: 2_500_000,
          elevationGainMeters: 35_000,
          movingTimeSeconds: 380_000,
          rides: 110,
          year: 2025,
        },
        {
          distanceMeters: 1_586_356,
          elevationGainMeters: 20_578,
          movingTimeSeconds: 238_000,
          rides: 69,
          year: 2026,
        },
      ],
    },
    {
      elevationGainMeters: 75_590,
      id: 'b2',
      longest: {
        distanceMeters: 180_000,
        name: 'Marshall Wall Sunday',
        startDate: '2025-05-18T16:00:00Z',
        url: 'https://www.strava.com/activities/41',
      },
      movingTimeSeconds: 774_000,
      name: 'Prince',
      odometerMeters: 5_333_366,
      rides: 100,
      years: [
        {
          distanceMeters: 1_500_000,
          elevationGainMeters: 20_000,
          movingTimeSeconds: 220_000,
          rides: 30,
          year: 2024,
        },
        {
          distanceMeters: 2_500_000,
          elevationGainMeters: 36_000,
          movingTimeSeconds: 360_000,
          rides: 45,
          year: 2025,
        },
        {
          distanceMeters: 1_333_366,
          elevationGainMeters: 19_590,
          movingTimeSeconds: 194_000,
          rides: 25,
          year: 2026,
        },
      ],
    },
  ],
  latest,
  outings: [presidio, merritt, tahoe, century],
  streetCoverage: {
    sd: {
      neighborhoods: [],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: {},
      viewBox: '0 0 10 10',
    },
    sf: {
      neighborhoods: [
        { name: 'Mission', outline: 'M0 0l10 0 0 10z', streetMeters: 3218.688 },
        { name: 'Presidio', outline: 'M10 0l10 0 0 10z', streetMeters: 3218.688 },
      ],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: { 'all all': [2414.016, 804.672], 'ride all': [0, 804.672] },
      viewBox: '0 0 20 10',
    },
  },
  thisYear: { distanceMeters: 32_186, elevationGainMeters: 240, outings: 2, year: 2026 },
  totals: { distanceMeters: 172_653, elevationGainMeters: 2_140, firstYear: 2024, outings: 4 },
};

const lone = outing(9, {
  elevationGainMeters: 0,
  name: 'Treadmill',
  sport: 'other',
  startDate: '2024-03-02T15:00:00Z',
});

const sparse: StravaHistory = {
  bikes: [],
  latest: { ...lone, description: null },
  outings: [lone],
  streetCoverage: {
    sd: {
      neighborhoods: [],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: {},
      viewBox: '0 0 10 10',
    },
    sf: {
      neighborhoods: [],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: {},
      viewBox: '0 0 10 10',
    },
  },
  thisYear: { distanceMeters: 0, elevationGainMeters: 0, outings: 0, year: 2026 },
  totals: { distanceMeters: 16_093, elevationGainMeters: 0, firstYear: 2024, outings: 1 },
};

const renderSections = (history: StravaHistory) =>
  render(
    <ServerTimeProvider serverTime={NOW}>
      <StravaHistorySections history={history} />
    </ServerTimeProvider>,
  );

const headlineTotals = () =>
  within(screen.getByRole('list', { name: /^Totals/ }))
    .getAllByRole('listitem')
    .map((cut) => cut.textContent);

const listNames = (heading: string) =>
  within(screen.getByRole('heading', { name: heading }).parentElement as HTMLElement)
    .queryAllByRole('listitem')
    .map((row) => within(row).queryByRole('link')?.textContent ?? row.textContent);

/** Card maps measure themselves; jsdom has no layout, so the frame's own size stands. */
class StillResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: StillResizeObserver,
  });
});

afterEach(() => {
  jest.useRealTimers();
  Reflect.deleteProperty(globalThis, 'ResizeObserver');
});

describe('StravaHistorySections', () => {
  it('lays out every section for a full history', () => {
    renderSections(full);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      'Recent routes',
      'San Francisco',
      'Climbing by month',
      'Recent activities',
      'Longest rides',
      'Yearly miles',
      'Biggest climbs',
      'Bike odometers',
    ]);
    expect(
      screen.getByRole('region', { name: "Map of every route I've tracked on Strava" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '2,034 feet climbed, all time, by month' }),
    ).toBeVisible();
    expect(screen.getByText('1 route')).toBeInTheDocument();
    expect(getDesktopButton('Runs')).toBeInTheDocument();
    expect(getDesktopButton('Hikes')).toBeInTheDocument();
    expect(getDesktopButton('Rides')).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(screen.getByRole('group', { name: 'Time span' })).getByText('Year'),
    ).toBeInTheDocument();
  });

  it('measures San Francisco street coverage for whatever the filters pick', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);
    const streets = () => screen.getByRole('region', { name: 'San Francisco streets' });

    expect(within(streets()).getByRole('heading', { name: 'San Francisco' })).toBeInTheDocument();
    expect(within(streets()).getByText('0.5 of 4.0 mi ridden')).toBeInTheDocument();
    expect(within(streets()).getByText('Presidio · 25.0%')).toBeInTheDocument();

    await user.click(getDesktopButton('All sports'));
    expect(within(streets()).getByText('2.0 of 4.0 mi ridden')).toBeInTheDocument();
    expect(within(streets()).getByText('Mission · 75.0%')).toBeInTheDocument();
  });

  it('prints the newest outings of the active sport, and seals only the latest overall', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);

    const recent = () => screen.getByRole('region', { name: 'Recent routes' });
    const labels = () =>
      within(recent())
        .getAllByRole('link')
        .map((print) => print.getAttribute('aria-label'));

    expect(labels()).toEqual(['Presidio loop on Strava', 'Marin century on Strava']);
    const [first] = within(recent()).getAllByRole('link');
    expect(first).toHaveAttribute('href', 'https://www.strava.com/activities/1');
    expect(first).toHaveTextContent('Ride2 days ago · Oct 20Presidio loop');
    expect(within(first as HTMLElement).getByText('Latest')).toBeInTheDocument();
    expect(first).toHaveTextContent('Fog burned off by the bridge.');

    await user.click(getDesktopButton('All sports'));
    expect(labels()).toEqual([
      'Presidio loop on Strava',
      'Lake Merritt run on Strava',
      'Tahoe rim hike on Strava',
    ]);
    const prints = within(recent()).getAllByRole('link');
    expect(prints[1]).toHaveTextContent('Run4 days ago · Oct 18Lake Merritt run');
    expect(prints[2]).toHaveTextContent('Hike');
    expect(prints[2]).toHaveTextContent('Jul 4Tahoe rim hike');

    await user.click(getDesktopButton('Hikes'));
    expect(labels()).toEqual(['Tahoe rim hike on Strava']);
    expect(within(recent()).queryByText('Latest')).not.toBeInTheDocument();
  });

  it('totals and lists whatever the sport and time filters pick', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);

    await user.click(getDesktopButton('All sports'));
    expect(headlineTotals()).toEqual([
      'All sports · All time4.1marathons107 mi',
      '24%of an Everest7.02k ft climbed',
      '35%of a day on the move9 hrs · 4 activities',
    ]);
    expect(listNames('Longest rides')).toEqual(['Marin century', 'Presidio loop']);

    await user.click(getDesktopButton('Runs'));
    expect(headlineTotals()).toEqual([
      'Runs · All time5.9×across the Golden Gate10.0 mi',
      '1%of an Everest394 ft climbed',
      '4%of a day on the move1 hr · 1 activity',
    ]);
    expect(listNames('Recent activities')).toEqual(['Lake Merritt run']);
    expect(listNames('Longest runs')).toEqual(['Lake Merritt run']);
    expect(screen.getByText('1 route')).toBeInTheDocument();

    await user.click(getDesktopButton('All sports'));
    await user.click(getDesktopButton('This week'));
    expect(screen.getAllByText('This week')).not.toHaveLength(0);
    expect(listNames('Recent activities')).toEqual(['Presidio loop', 'Lake Merritt run']);
    expect(listNames('Biggest climbs')).toEqual(['Presidio loop', 'Lake Merritt run']);

    await user.click(screen.getByText('Year'));
    await user.click(getDesktopButton('2025', false));
    expect(getDesktopButton('This week')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('list', { name: 'Totals, All sports · 2025' })).toBeInTheDocument();
    expect(headlineTotals()).toEqual([
      'All sports · 20251.9marathons50.0 mi',
      '16%of an Everest4.59k ft climbed',
      '23%of a day on the move6 hrs · 1 activity',
    ]);
    expect(listNames('Longest rides')).toEqual(['Nothing here for these filters']);
    expect(screen.getAllByText('Longest activity')).toHaveLength(1);
    expect(
      screen
        .getAllByRole('link', { name: 'Tahoe rim hike on Strava' })
        .some((link) => link.textContent?.includes('Longest activity')),
    ).toBe(true);
  });

  it('gives each bike its odometer, climbing, saddle time, yearly miles, and longest ride', () => {
    renderSections(full);

    const bikes = screen.getByRole('heading', { name: 'Bike odometers' })
      .parentElement as HTMLElement;
    const [cruz, prince] = within(bikes).getAllByRole('listitem') as [HTMLElement, HTMLElement];

    expect(cruz).toHaveTextContent(
      /^Cruz2023–20265,646mi412k ftclimbed380 hrsin the saddle399rides.*Longest · 118 mi · May 19, 2024Oysters and garlic bread$/,
    );
    expect(prince).toHaveTextContent(
      /^Prince2024–20263,314mi248k ftclimbed215 hrsin the saddle100rides.*Longest · 112 mi · May 18, 2025Marshall Wall Sunday$/,
    );
    expect(bikes.querySelector('ul')?.textContent).not.toMatch(/bike/i);
    expect(
      within(cruz)
        .getAllByRole('button')
        .map((year) => year.getAttribute('aria-label')),
    ).toEqual(['2023: 1,243 mi', '2024: 1,864 mi', '2025: 1,553 mi', '2026 so far: 986 mi']);
    expect(
      within(cruz).getByRole('img', { name: 'Black Santa Cruz Stigmata gravel bike' }),
    ).toBeVisible();
    const princeArt = within(prince).getByRole('img', {
      name: 'White Pinarello Prince road bike',
    });
    expect(princeArt).toBeVisible();
    expect(
      princeArt.querySelector('.strava__bikeContour + .strava__bikeTape--pink'),
    ).not.toBeNull();
    expect(within(prince).getByRole('link')).toHaveAttribute(
      'href',
      'https://www.strava.com/activities/41',
    );
  });

  it('swaps a bike ticket to the year hovered or focused, then back', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);
    const cruz = within(
      screen.getByRole('heading', { name: 'Bike odometers' }).parentElement as HTMLElement,
    ).getAllByRole('listitem')[0] as HTMLElement;
    const before = cruz.getBoundingClientRect();

    await user.hover(within(cruz).getByRole('button', { name: '2024: 1,864 mi' }));
    expect(cruz).toHaveTextContent(/^Cruz20241,864mi148k ftclimbed125 hrsin the saddle140rides/);
    expect(cruz.getBoundingClientRect()).toEqual(before);

    await user.unhover(within(cruz).getByRole('button', { name: '2024: 1,864 mi' }));
    expect(cruz).toHaveTextContent(/^Cruz2023–20265,646mi/);

    act(() => within(cruz).getByRole('button', { name: '2023: 1,243 mi' }).focus());
    expect(cruz).toHaveTextContent(/^Cruz20231,243mi82k ftclimbed83 hrsin the saddle80rides/);
  });

  it('puts the hovered month in the climbing flower and leaves months to come inert', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);
    const flower = screen.getByRole('heading', { name: 'Climbing by month' }).parentElement
      ?.parentElement as HTMLElement;
    const months = within(flower).getAllByRole('button');
    expect(months).toHaveLength(12);

    await user.hover(within(flower).getByRole('button', { name: /^May: / }));
    expect(flower).toHaveTextContent(/May · [\d,]+ ft/);

    await user.click(screen.getByText('Year'));
    await user.click(getDesktopButton('2026', false));
    const thisYear = within(flower)
      .getAllByRole('button')
      .map((month) => month.getAttribute('aria-label'));
    expect(thisYear).toHaveLength(10);
    expect(thisYear.at(-1)).toMatch(/^Oct so far: /);
    expect(within(flower).queryByRole('button', { name: /^Nov/ })).toBeNull();
  });

  it('keeps its footprint for a sparse history without inventing numbers', () => {
    const { container } = renderSections(sparse);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      'Recent routes',
      'Climbing by month',
      'Recent activities',
      'Longest rides',
      'Yearly miles',
      'Biggest climbs',
    ]);
    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
    expect(screen.getByText('No routes')).toBeInTheDocument();
    expect(screen.queryByText('Longest activity')).not.toBeInTheDocument();
    expect(screen.queryByText('Best year')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity/);
  });

  it('never prints NaN for a full history either', () => {
    const { container } = renderSections(full);

    expect(container.textContent).not.toMatch(/NaN|undefined|Infinity/);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it('cuts every card, tag, and sticker from the shared paper tones', () => {
    const { container } = renderSections(full);

    const tones = [...container.querySelectorAll<HTMLElement>('[style*="--pc"]')].map((paper) =>
      paper.style.getPropertyValue('--pc'),
    );
    const allowed = PAPER_TONES.map((tone) => `var(--${tone})`);

    expect(tones.length).toBeGreaterThan(10);
    expect(tones.filter((tone) => !allowed.includes(tone))).toEqual([]);
  });
});
