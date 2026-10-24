import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import type { StreetCoverage } from '@dg/content-models/strava/StreetCoverage';
import { encodePolyline } from '@dg/maps/src/routeGeometry';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StravaFilters } from '../StravaFilters';
import { StreetCoverageSection } from '../StreetCoverageSection';

const TWO_MILES = 2 * 1609.344;

/** Alphabetical, each with two miles of street, and the share of it ridden. */
const NEIGHBORHOODS = [
  ['Bayview', 0.2],
  ['Castro/Upper Market', 0.6],
  ['Chinatown', 0.1],
  ['Excelsior', 0.3],
  ['Glen Park', 0.5],
  ['Haight Ashbury', 0.55],
  ['Marina', 0.4],
  ['Mission', 0.9],
  ['Nob Hill', 0.2],
  ['Noe Valley', 0.7],
  ['Presidio', 0.35],
  ['Treasure Island', 0],
] as const;

const coverage: StreetCoverage = {
  neighborhoods: NEIGHBORHOODS.map(([name], index) => ({
    name,
    outline: `M${index * 10} 0l10 0 0 10z`,
    streetMeters: TWO_MILES,
  })),
  projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1000, lng: 1000 } },
  ridden: {
    'ride all': NEIGHBORHOODS.map(([, share]) => share * TWO_MILES),
    'run all': NEIGHBORHOODS.map(([name]) => (name === 'Mission' ? 0.25 * TWO_MILES : 0)),
  },
  viewBox: '0 0 120 10',
};

const sanDiego: StreetCoverage = {
  neighborhoods: [
    { name: 'North Park', outline: 'M0 0l10 0 0 10z', streetMeters: TWO_MILES },
    { name: 'Uptown', outline: 'M10 0l10 0 0 10z', streetMeters: TWO_MILES },
  ],
  projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1000, lng: 1000 } },
  ridden: { 'ride all': [0.5 * TWO_MILES, 0] },
  viewBox: '0 0 20 10',
};

/** A straight route east along `y` in view box units, from `fromX` to `toX`. */
const eastward = (y: number, fromX: number, toX: number) =>
  encodePolyline([
    [-y / 1000, fromX / 1000],
    [-y / 1000, toX / 1000],
  ]);

const outing = (id: number, sport: StravaSport, polyline: string | null): StravaLogEntry => ({
  distanceMeters: 10_000,
  elevationGainMeters: 100,
  id,
  movingTimeSeconds: 1800,
  name: `Outing ${id}`,
  polyline,
  sport,
  startDate: '2026-10-20T15:00:00Z',
  url: `https://www.strava.com/activities/${id}`,
});

const renderSection = () => {
  const { container } = render(
    <StravaFilters
      outings={[outing(1, 'ride', eastward(5, 0, 40)), outing(2, 'run', eastward(5, 70, 80))]}
    >
      <StreetCoverageSection coverage={{ sd: sanDiego, sf: coverage }} />
    </StravaFilters>,
  );
  const section = screen.getByRole('region', { name: 'San Francisco streets' });
  const header = () => {
    const card = section.querySelector('.streets__head');
    return card?.textContent ?? '';
  };
  const hoods = () => [...container.querySelectorAll('.streets__hood')];
  const routes = () => container.querySelector('.streets__routes');
  const rows = () =>
    within(screen.getByRole('heading', { name: 'By neighborhood' }).parentElement ?? section)
      .getAllByRole('listitem')
      .map((row) => row.textContent);
  const callouts = () => within(section.querySelector('.streets__callouts') as HTMLElement);
  return { callouts, header, hoods, routes, rows, section };
};

describe('StreetCoverageSection', () => {
  it('calls out the city share, the most ridden neighborhood, and how many are explored', () => {
    const { callouts, header } = renderSection();

    expect(callouts().getByText('40.0%')).toBeInTheDocument();
    expect(callouts().getByText('9.6 of 24.0 mi ridden')).toBeInTheDocument();
    expect(callouts().getByText('Mission · 90.0%')).toBeInTheDocument();
    expect(callouts().getByText('11')).toBeInTheDocument();
    expect(callouts().getByText('of 12')).toBeInTheDocument();
    expect(header()).toBe('San Francisco40.0%9.6 of 24.0 mi');
  });

  it('lets the interface speak for itself, with no instructions', () => {
    const { section } = renderSection();
    expect(section.textContent).not.toMatch(/hover|tap|click|select a/i);
  });

  it('ranks the top ten neighborhoods and expands to all of them', async () => {
    const user = userEvent.setup();
    const { rows } = renderSection();

    expect(rows()).toHaveLength(10);
    expect(rows()[0]).toBe('1Mission90.0%');
    expect(rows()[1]).toBe('2Noe Valley70.0%');
    expect(rows()[2]).toBe('3Castro / Upper Market60.0%');
    expect(rows()[9]).toBe('10Nob Hill20.0%');

    const toggle = screen.getByRole('button', { name: 'All 12 neighborhoods' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveClass('paperButton');
    await user.click(toggle);
    expect(rows()).toHaveLength(12);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(rows()[11]).toBe('12Treasure Island0.0%');

    await user.click(screen.getByRole('button', { name: 'Top 10' }));
    expect(rows()).toHaveLength(10);
  });

  it('shows a neighborhood’s figures while a row or its shape is hovered', async () => {
    const user = userEvent.setup();
    const { header, hoods } = renderSection();

    await user.hover(screen.getByRole('button', { name: /Noe Valley/ }));
    expect(header()).toBe('Noe Valley70.0%1.4 of 2.0 mi');
    await user.unhover(screen.getByRole('button', { name: /Noe Valley/ }));
    expect(header()).toBe('San Francisco40.0%9.6 of 24.0 mi');

    await user.hover(hoods()[3] as Element);
    expect(header()).toBe('Excelsior30.0%0.6 of 2.0 mi');
    expect(hoods()[3]).toHaveAttribute('data-tier', '2');
    expect(document.querySelector('.streets__focus')).toHaveAttribute('d', 'M30 0l10 0 0 10z');
  });

  it('pins a picked neighborhood until it is picked again', async () => {
    const user = userEvent.setup();
    const { header, hoods } = renderSection();
    const mission = screen.getByRole('button', { name: /Mission/ });

    const noe = screen.getByRole('button', { name: /Noe Valley/ });

    await user.click(mission);
    await user.unhover(mission);
    expect(mission).toHaveAttribute('aria-pressed', 'true');
    expect(header()).toBe('Mission90.0%1.8 of 2.0 mi');
    await user.hover(noe);
    expect(header()).toMatch(/^Noe Valley/);
    await user.unhover(noe);
    expect(header()).toBe('Mission90.0%1.8 of 2.0 mi');

    await user.click(hoods()[7] as Element);
    await user.unhover(hoods()[7] as Element);
    expect(mission).toHaveAttribute('aria-pressed', 'false');
    expect(header()).toMatch(/^San Francisco/);
  });

  it('follows the sport filter', async () => {
    const user = userEvent.setup();
    const { callouts, header } = renderSection();

    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(header()).toBe('San Francisco2.1%0.5 of 24.0 mi');
    expect(callouts().getByText('Mission · 25.0%')).toBeInTheDocument();
    expect(callouts().getByText('1')).toBeInTheDocument();
  });

  it('traces the filtered routes over the land', async () => {
    const user = userEvent.setup();
    const { routes } = renderSection();

    expect(routes()).toHaveAttribute('d', 'M0 5l40 0');
    const land = document.getElementById(
      routes()
        ?.getAttribute('clip-path')
        ?.match(/^url\(#(.+)\)$/)?.[1] ?? '',
    );
    expect(land?.tagName).toBe('clipPath');

    await user.click(screen.getByRole('button', { name: 'All sports' }));
    expect(routes()).toHaveAttribute('d', 'M0 5l40 0M70 5l10 0');
    await user.click(screen.getByRole('button', { name: 'Runs' }));
    expect(routes()).toHaveAttribute('d', 'M70 5l10 0');
  });

  it('shows nothing ridden for filters that cover no streets', async () => {
    const user = userEvent.setup();
    const { callouts, header } = renderSection();

    await user.click(screen.getByRole('button', { name: 'This week' }));
    expect(header()).toBe('San Francisco0.0%0.0 of 24.0 mi');
    expect(callouts().queryByText(/Most ridden/)).not.toBeInTheDocument();
    expect(callouts().getByText('0')).toBeInTheDocument();
  });

  it('switches between San Francisco and San Diego', async () => {
    const user = userEvent.setup();
    const { callouts, header, rows, section } = renderSection();
    const sf = screen.getByRole('button', { name: 'San Francisco' });
    const sd = screen.getByRole('button', { name: 'San Diego' });
    expect(sf).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /Mission/ }));
    await user.click(sd);
    expect(sd).toHaveAttribute('aria-pressed', 'true');
    expect(section).toHaveAccessibleName('San Diego streets');
    expect(header()).toBe('San Diego25.0%1.0 of 4.0 mi');
    expect(callouts().getByText('of SD')).toBeInTheDocument();
    expect(callouts().getByText('North Park · 50.0%')).toBeInTheDocument();
    expect(callouts().getByText('of 2')).toBeInTheDocument();
    expect(rows()).toEqual(['1North Park50.0%', '2Uptown0.0%']);

    await user.click(sf);
    expect(header()).toBe('San Francisco40.0%9.6 of 24.0 mi');
  });
});
