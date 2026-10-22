import type { StravaHistory, StravaOuting } from '@dg/content-models/strava/StravaHistory';
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
  gearName: 'Cruz',
  id: 101,
  movingTimeSeconds: 4_320,
  name: 'Goals',
  polyline: PRESIDIO,
  sport: 'ride',
  startDate: '2026-10-20T15:00:00Z',
  url: 'https://www.strava.com/activities/101',
};

const history: StravaHistory = {
  biggestClimbs: [latest],
  latest,
  longest: latest,
  monthlyClimbingMeters: Array.from({ length: 12 }, () => 0),
  odometer: null,
  recent: [latest],
  routes: [
    { id: 101, polyline: PRESIDIO, sport: 'ride', year: 2026 },
    { id: 102, polyline: LAKE_MERRITT, sport: 'run', year: 2025 },
    { id: 103, polyline: TAHOE, sport: 'hike', year: 2024 },
  ],
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
  years: [],
};

const renderCard = (value: StravaHistory | null) =>
  render(
    <ServerTimeProvider serverTime={NOW}>
      <StravaCard history={value} />
    </ServerTimeProvider>,
  );

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('StravaCard', () => {
  it('renders nothing without a history', () => {
    const { container } = renderCard(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens the atlas from the map of every route, counting the routes it shows', () => {
    renderCard(history);

    const atlas = screen.getByRole('link', { name: 'Bay Area miles' });
    expect(atlas).toHaveAttribute('href', '/strava');
    expect(
      within(atlas).getByRole('img', { name: "Every route I've tracked around the Bay" }),
    ).toBeInTheDocument();
    expect(within(atlas).getByText('2 routes')).toBeInTheDocument();
  });

  it('links the latest print to the outing on Strava with how long ago it was', () => {
    renderCard(history);

    const print = screen.getByRole('link', { name: 'Goals on Strava' });
    expect(print).toHaveAttribute('href', 'https://www.strava.com/activities/101');
    expect(within(print).getByRole('img', { name: 'Goals' })).toBeInTheDocument();
    expect(within(print).getByText('15.9 mi')).toBeInTheDocument();
    expect(within(print).getByText('Latest')).toBeInTheDocument();
    expect(within(print).getByText('2 days ago')).toBeInTheDocument();
  });

  it('sticks on this year’s miles and climbing, and seals the atlas with the lifetime total', () => {
    renderCard(history);

    const totals = screen.getByRole('list', { name: 'Strava totals' });
    expect(
      within(totals)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['This year1,420 mi', 'Climbed61.5k ft']);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('18,240 mi')).toBeInTheDocument();
  });

  it('keeps the latest outing as a plain print when its route is off the painted Bay', () => {
    renderCard({ ...history, latest: { ...latest, polyline: TAHOE } });

    const print = screen.getByRole('link', { name: 'Goals on Strava' });
    expect(within(print).queryByRole('img')).not.toBeInTheDocument();
    expect(within(print).getByText('Goals')).toBeInTheDocument();
  });

  it('nests no link inside another', () => {
    const { container } = renderCard(history);

    expect(container.querySelectorAll('a a')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
