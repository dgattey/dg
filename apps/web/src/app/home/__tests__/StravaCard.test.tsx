import type {
  StravaHistory,
  StravaLogEntry,
  StravaOuting,
} from '@dg/content-models/strava/StravaHistory';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen, within } from '@testing-library/react';
import { StravaCard } from '../StravaCard';

jest.mock('@dg/ui/core/transitions/PageTransitionLink', () => ({
  PageTransitionLink: ({
    children,
    href,
    title,
  }: {
    children: React.ReactNode;
    href: string;
    title: string;
  }) => (
    <a aria-label={title} href={href}>
      {children}
    </a>
  ),
}));

const NOW = Date.parse('2026-10-22T15:00:00Z');
const METERS_PER_MILE = 1609.344;
const METERS_PER_FOOT = 0.3048;

const PRESIDIO = '_yueFn|njVo}@n}@_|BoKn}@_nD~{B~{B';
const LAKE_MERRITT = '_yueFnhfiV_q@wj@f^_q@vj@fw@_Xnd@';
const TAHOE = 'owqmFnjr{Uo}@o}@o}@~{B';

const latest: StravaOuting = {
  description: null,
  distanceMeters: 15.9 * METERS_PER_MILE,
  elevationGainMeters: 892 * METERS_PER_FOOT,
  id: 101,
  movingTimeSeconds: 4_320,
  name: 'Goals',
  polyline: PRESIDIO,
  sport: 'ride',
  startDate: '2026-10-20T15:00:00Z',
  url: 'https://www.strava.com/activities/101',
};

const { description: _, ...latestEntry } = latest;

const route = (id: number, polyline: string, sport: StravaLogEntry['sport']): StravaLogEntry => ({
  ...latestEntry,
  id,
  name: `Outing ${id}`,
  polyline,
  sport,
  startDate: '2024-06-01T15:00:00Z',
  url: `https://www.strava.com/activities/${id}`,
});

const history: StravaHistory = {
  bikes: [],
  latest,
  outings: [
    latestEntry,
    route(102, LAKE_MERRITT, 'run'),
    route(103, TAHOE, 'hike'),
    { ...route(104, '', 'ride'), polyline: null },
  ],
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
  thisYear: {
    distanceMeters: 1_420 * METERS_PER_MILE,
    elevationGainMeters: 61_500 * METERS_PER_FOOT,
    outings: 90,
    year: 2026,
  },
  totals: {
    distanceMeters: 18_240 * METERS_PER_MILE,
    elevationGainMeters: 900_000,
    firstYear: 2014,
    outings: 1_906,
  },
};

const inkedTones = (element: HTMLElement) =>
  [...element.querySelectorAll('path[data-tone]')].map((path) => path.getAttribute('data-tone'));

const renderCard = (value: StravaHistory | null) =>
  render(
    <ServerTimeProvider serverTime={NOW}>
      <StravaCard history={value} />
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

describe('StravaCard', () => {
  it('renders nothing without a history', () => {
    const { container } = renderCard(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens the atlas from a map of the routes around home, counting every route', () => {
    renderCard(history);

    expect(screen.getByRole('heading', { name: 'Big map' })).toBeInTheDocument();
    const atlas = screen.getByRole('link', { name: 'Big map' });
    expect(atlas).toHaveAttribute('href', '/activities');
    expect(inkedTones(atlas)).toEqual(['cobalt', 'vermilion']);
    expect(within(atlas).getByText('3 routes')).toBeInTheDocument();
    expect(within(atlas).getByText('0.7× around Earth')).toBeInTheDocument();
    expect(within(atlas).getByText('Explore big map →')).toBeInTheDocument();
  });

  it('links the latest print to the outing on Strava with its sport and how long ago it was', () => {
    renderCard(history);

    const print = screen.getByRole('link', { name: 'Goals on Strava' });
    expect(print).toHaveAttribute('href', 'https://www.strava.com/activities/101');
    expect(inkedTones(print)).toEqual(['cobalt']);
    expect(within(print).getByText('15.9 mi')).toBeInTheDocument();
    expect(within(print).getByText('Latest ride')).toBeInTheDocument();
    expect(within(print).getByText('2 days ago')).toBeInTheDocument();
  });

  it('names each sport in sentence case on the latest sticker', () => {
    const { rerender } = renderCard({ ...history, latest: { ...latest, sport: 'ski' } });
    expect(screen.getByText('Latest ski')).toBeInTheDocument();

    rerender(
      <ServerTimeProvider serverTime={NOW}>
        <StravaCard history={{ ...history, latest: { ...latest, sport: 'hike' } }} />
      </ServerTimeProvider>,
    );
    expect(screen.getByText('Latest hike')).toBeInTheDocument();

    rerender(
      <ServerTimeProvider serverTime={NOW}>
        <StravaCard history={{ ...history, latest: { ...latest, sport: 'run' } }} />
      </ServerTimeProvider>,
    );
    expect(screen.getByText('Latest run')).toBeInTheDocument();

    rerender(
      <ServerTimeProvider serverTime={NOW}>
        <StravaCard history={{ ...history, latest: { ...latest, sport: 'other' } }} />
      </ServerTimeProvider>,
    );
    expect(screen.getByText('Latest outing')).toBeInTheDocument();
  });

  it('sticks on this year’s miles and seals the atlas with the lifetime total', () => {
    renderCard(history);

    expect(screen.getByText('This year')).toBeInTheDocument();
    expect(screen.getByText('1,420 mi')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('18,240 mi')).toBeInTheDocument();
  });

  it('keeps the latest outing as a plain print when it has no route', () => {
    renderCard({ ...history, latest: { ...latest, polyline: null } });

    const print = screen.getByRole('link', { name: 'Goals on Strava' });
    expect(inkedTones(print)).toEqual([]);
    expect(within(print).getByText('Goals')).toBeInTheDocument();
  });

  it('nests no link inside another', () => {
    const { container } = renderCard(history);

    expect(container.querySelectorAll('a a')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
