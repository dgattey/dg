import type { StravaHistory, StravaOuting } from '@dg/content-models/strava/StravaHistory';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import { PAPER_TONES } from '../../collage/types';
import { StravaHistorySections } from '../StravaHistorySections';

const NOW = Date.parse('2026-10-22T15:00:00Z');

const PRESIDIO = '_yueFn|njVo}@n}@_|BoKn}@_nD~{B~{B';
const LAKE_MERRITT = '_yueFnhfiV_q@wj@f^_q@vj@fw@_Xnd@';
const TAHOE = 'owqmFnjr{Uo}@o}@o}@~{B';

const outing = (id: number, overrides: Partial<StravaOuting>): StravaOuting => ({
  description: null,
  distanceMeters: 16_093,
  elevationGainMeters: 120,
  gearName: null,
  id,
  movingTimeSeconds: 3_600,
  name: `Outing ${id}`,
  polyline: null,
  sport: 'ride',
  startDate: '2026-10-01T15:00:00Z',
  url: `https://www.strava.com/activities/${id}`,
  ...overrides,
});

const latest = outing(1, {
  description: 'Fog burned off by the bridge.',
  gearName: 'Cervelo',
  name: 'Presidio loop',
  polyline: PRESIDIO,
  startDate: '2026-10-20T15:00:00Z',
});
const merritt = outing(2, {
  name: 'Lake Merritt run',
  polyline: LAKE_MERRITT,
  sport: 'run',
  startDate: '2026-10-18T15:00:00Z',
});
const tahoe = outing(3, {
  distanceMeters: 80_467,
  elevationGainMeters: 1_400,
  name: 'Tahoe rim hike',
  polyline: TAHOE,
  sport: 'hike',
  startDate: '2025-07-04T15:00:00Z',
});

const full: StravaHistory = {
  biggestClimbs: [tahoe, latest, merritt],
  latest,
  longest: tahoe,
  monthlyClimbingMeters: [0, 0, 300, 0, 0, 0, 0, 0, 0, 240, 0, 0],
  odometer: { distanceMeters: 7_829_000, gearName: 'Cervelo' },
  recent: [latest, merritt, tahoe],
  routes: [
    { id: 1, polyline: PRESIDIO, sport: 'ride', year: 2026 },
    { id: 2, polyline: LAKE_MERRITT, sport: 'run', year: 2026 },
    { id: 3, polyline: TAHOE, sport: 'hike', year: 2025 },
  ],
  thisYear: { distanceMeters: 32_186, elevationGainMeters: 540, outings: 2, year: 2026 },
  totals: { distanceMeters: 112_653, elevationGainMeters: 1_640, firstYear: 2025, outings: 3 },
  years: [
    { distanceMeters: 80_467, elevationGainMeters: 1_400, outings: 1, year: 2025 },
    { distanceMeters: 32_186, elevationGainMeters: 540, outings: 2, year: 2026 },
  ],
};

const lone = outing(9, {
  elevationGainMeters: 0,
  name: 'Treadmill',
  sport: 'other',
  startDate: '2024-03-02T15:00:00Z',
});

const sparse: StravaHistory = {
  biggestClimbs: [lone],
  latest: lone,
  longest: lone,
  monthlyClimbingMeters: Array.from({ length: 12 }, () => 0),
  odometer: null,
  recent: [lone],
  routes: [],
  thisYear: { distanceMeters: 0, elevationGainMeters: 0, outings: 0, year: 2026 },
  totals: { distanceMeters: 16_093, elevationGainMeters: 0, firstYear: 2024, outings: 1 },
  years: [{ distanceMeters: 16_093, elevationGainMeters: 0, outings: 1, year: 2024 }],
};

const renderSections = (history: StravaHistory) =>
  render(
    <ServerTimeProvider serverTime={NOW}>
      <StravaHistorySections history={history} />
    </ServerTimeProvider>,
  );

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
    ).toEqual(['Climbing by month', 'Recent outings', 'Yearly miles', 'Biggest climbs']);
    expect(
      screen.getByRole('region', { name: "Map of every route I've tracked on Strava" }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '1,772 feet climbed in 2026, by month' })).toBeVisible();
    expect(screen.getByText('3 routes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Runs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hikes' })).toBeInTheDocument();
    expect(screen.getByText('Cervelo odometer')).toBeInTheDocument();
    expect(screen.getByText('4,865 mi')).toBeInTheDocument();
    expect(screen.getByText('Best year')).toBeInTheDocument();
  });

  it('notes the latest outing with how long ago it was', () => {
    renderSections(full);

    const hrefs = screen
      .getAllByRole('link', { name: 'Presidio loop' })
      .map((link) => link.getAttribute('href'));
    expect(new Set(hrefs)).toEqual(new Set(['https://www.strava.com/activities/1']));
    expect(screen.getByText('Fog burned off by the bridge.')).toBeInTheDocument();
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('prints a polaroid for outings with a route wherever they went', () => {
    renderSections(full);

    expect(screen.getByRole('link', { name: 'Lake Merritt run on Strava' })).toHaveAttribute(
      'href',
      'https://www.strava.com/activities/2',
    );
    expect(screen.getAllByRole('link', { name: 'Tahoe rim hike on Strava' })).toHaveLength(2);
    expect(screen.getByText('Longest outing')).toBeInTheDocument();
  });

  it('skips empty pieces for a sparse history instead of drawing blanks', () => {
    const { container } = renderSections(sparse);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['Recent outings', 'Yearly miles']);
    expect(screen.queryByRole('group', { name: 'Sport' })).not.toBeInTheDocument();
    expect(screen.getByText('No routes')).toBeInTheDocument();
    expect(screen.queryByText(/odometer/)).not.toBeInTheDocument();
    expect(screen.queryByText('Best year')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /on Strava$/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Treadmill' })).toHaveLength(2);
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
