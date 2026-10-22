import type {
  StravaHistory,
  StravaLogEntry,
  StravaOuting,
} from '@dg/content-models/strava/StravaHistory';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PAPER_TONES } from '../../collage/types';
import { StravaHistorySections } from '../StravaHistorySections';

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
        { distanceMeters: 2_000_000, year: 2023 },
        { distanceMeters: 3_000_000, year: 2024 },
        { distanceMeters: 2_500_000, year: 2025 },
        { distanceMeters: 1_586_356, year: 2026 },
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
        { distanceMeters: 1_500_000, year: 2024 },
        { distanceMeters: 2_500_000, year: 2025 },
        { distanceMeters: 1_333_366, year: 2026 },
      ],
    },
  ],
  latest,
  outings: [presidio, merritt, tahoe, century],
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
      'Climbing by month',
      'Recent outings',
      'Longest rides',
      'Yearly miles',
      'Biggest climbs',
      'Bike odometers',
    ]);
    expect(
      screen.getByRole('region', { name: "Map of every route I've tracked on Strava" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '7,021 feet climbed, all time, by month' }),
    ).toBeVisible();
    expect(screen.getByText('3 routes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hikes' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Year' })).toBeInTheDocument();
  });

  it('prints the newest outings in order, each captioned with its sport and day', () => {
    renderSections(full);

    const recent = screen.getByRole('region', { name: 'Recent routes' });
    const prints = within(recent).getAllByRole('link');
    expect(prints.map((print) => print.getAttribute('aria-label'))).toEqual([
      'Presidio loop on Strava',
      'Lake Merritt run on Strava',
      'Tahoe rim hike on Strava',
    ]);
    expect(prints[0]).toHaveAttribute('href', 'https://www.strava.com/activities/1');
    expect(prints[0]).toHaveTextContent('Ride2 days ago · Oct 20Presidio loop');
    expect(within(prints[0] as HTMLElement).getByText('Latest')).toBeInTheDocument();
    expect(prints[0]).toHaveTextContent('Fog burned off by the bridge.');
    expect(prints[1]).toHaveTextContent('Run4 days ago · Oct 18Lake Merritt run');
    expect(prints[2]).toHaveTextContent('Hike');
    expect(prints[2]).toHaveTextContent('Jul 4Tahoe rim hike');
  });

  it('totals and lists whatever the sport and time filters pick', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSections(full);

    expect(headlineTotals()).toEqual([
      'Every sport · All time107miles',
      '7.02kft climbed≈ 24% of Everest',
      '4outings9 hrs moving',
    ]);
    expect(listNames('Longest rides')).toEqual(['Marin century', 'Presidio loop']);

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(headlineTotals()).toEqual([
      'Runs · All time10.0miles',
      '394ft climbed≈ 1% of Everest',
      '1outing1 hr moving',
    ]);
    expect(listNames('Recent outings')).toEqual(['Lake Merritt run']);
    expect(listNames('Longest runs')).toEqual(['Lake Merritt run']);
    expect(screen.getByText('1 route')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All routes' }));
    await user.click(screen.getByRole('button', { name: 'Last week' }));
    expect(screen.getAllByText('Last 7 days')).not.toHaveLength(0);
    expect(listNames('Recent outings')).toEqual(['Presidio loop', 'Lake Merritt run']);
    expect(listNames('Biggest climbs')).toEqual(['Presidio loop', 'Lake Merritt run']);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '2025');
    expect(screen.getByRole('button', { name: 'Last week' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('list', { name: 'Totals, Every sport · 2025' })).toBeInTheDocument();
    expect(headlineTotals()).toEqual([
      'Every sport · 202550.0miles',
      '4.59kft climbed≈ 16% of Everest',
      '1outing6 hrs moving',
    ]);
    expect(listNames('Longest rides')).toEqual(['Nothing here for these filters']);
    expect(screen.getAllByText('Longest outing')).toHaveLength(1);
    expect(
      screen
        .getAllByRole('link', { name: 'Tahoe rim hike on Strava' })
        .some((link) => link.textContent?.includes('Longest outing')),
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
      within(cruz).getByRole('img', {
        name: 'Miles by year. 2023: 1,243 mi, 2024: 1,864 mi, 2025: 1,553 mi, 2026: 986 mi',
      }),
    ).toBeInTheDocument();
    expect(within(prince).getByRole('link')).toHaveAttribute(
      'href',
      'https://www.strava.com/activities/41',
    );
  });

  it('keeps its footprint for a sparse history without inventing numbers', () => {
    const { container } = renderSections(sparse);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      'Recent routes',
      'Climbing by month',
      'Recent outings',
      'Longest rides',
      'Yearly miles',
      'Biggest climbs',
    ]);
    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Year' })).not.toBeInTheDocument();
    expect(screen.getByText('No routes')).toBeInTheDocument();
    expect(screen.queryByText('Longest outing')).not.toBeInTheDocument();
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
