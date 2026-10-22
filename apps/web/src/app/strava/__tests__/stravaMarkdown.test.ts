import type { StravaHistory, StravaLogEntry } from '@dg/content-models/strava/StravaHistory';

jest.mock('../../../services/strava', () => ({
  getStravaHistory: jest.fn(),
}));

import { getStravaHistory } from '../../../services/strava';
import { getStravaMarkdown } from '../stravaMarkdown';

const outing = (
  overrides: Partial<StravaLogEntry> & Pick<StravaLogEntry, 'id'>,
): StravaLogEntry => ({
  distanceMeters: 16_093.44,
  elevationGainMeters: 304.8,
  movingTimeSeconds: 3600,
  name: `Outing ${overrides.id}`,
  polyline: null,
  sport: 'ride',
  startDate: '2026-10-20T15:00:00.000Z',
  url: `https://www.strava.com/activities/${overrides.id}`,
  ...overrides,
});

const latest = outing({ id: 1, name: 'Hawk Hill loop' });
const hike = outing({
  distanceMeters: 8046.72,
  elevationGainMeters: 609.6,
  id: 2,
  name: 'Mount Tam',
  sport: 'hike',
  startDate: '2025-03-04T17:00:00.000Z',
});

const history: StravaHistory = {
  bikes: [
    {
      firstYear: 2023,
      id: 'b1',
      lastYear: 2026,
      name: 'Cruz',
      odometerMeters: 7_828_686,
      rides: 399,
    },
  ],
  latest: { ...latest, description: null },
  outings: [latest, hike],
  thisYear: { distanceMeters: 16_093.44, elevationGainMeters: 304.8, outings: 1, year: 2026 },
  totals: {
    distanceMeters: 24_140.16,
    elevationGainMeters: 914.4,
    firstYear: 2025,
    outings: 2,
  },
};

describe('getStravaMarkdown', () => {
  it('lists totals, this year, yearly miles, recent outings, records, and bikes', async () => {
    jest.mocked(getStravaHistory).mockResolvedValue(history);

    const markdown = await getStravaMarkdown();

    expect(markdown).toContain('# Big map');
    expect(markdown).toContain('- 15 miles over 2 outings since 2025\n- 3,000 feet climbed');
    expect(markdown).toContain('## This year\n\n- 2026: 10 miles, 1,000 feet climbed, 1 outing');
    expect(markdown).toContain(
      '## Yearly miles\n\n- 2025: 5 miles (1 outing)\n- 2026: 10 miles (1 outing)',
    );
    expect(markdown).toContain(
      '- [Hawk Hill loop](https://www.strava.com/activities/1) — Ride, 10 miles, 1,000 feet climbed, Oct 20, 2026',
    );
    expect(markdown).toContain(
      '## Biggest climbs\n\n- [Mount Tam](https://www.strava.com/activities/2) — 2,000 feet over 5 miles, Mar 4, 2025',
    );
    expect(markdown).toContain(
      '## Longest rides\n\n- [Hawk Hill loop](https://www.strava.com/activities/1) — 10 miles, 1,000 feet climbed, Oct 20, 2026',
    );
    expect(markdown).toContain(
      '## Bike odometers\n\n- Cruz (bike): 4,864.5 miles on the odometer, 399 rides from 2023 to 2026',
    );
    expect(markdown).toContain('[Reading](/reading.md)');
    expect(markdown).not.toContain('[Big map](/strava.md)');
  });

  it('keeps a sparse history readable', async () => {
    const quiet = outing({ distanceMeters: 0, elevationGainMeters: 0, id: 3, sport: 'other' });
    jest.mocked(getStravaHistory).mockResolvedValue({
      ...history,
      bikes: [],
      latest: { ...quiet, description: null },
      outings: [quiet],
      thisYear: { distanceMeters: 0, elevationGainMeters: 0, outings: 0, year: 2026 },
    });

    const markdown = await getStravaMarkdown();

    expect(markdown).toContain('- No outings yet in 2026');
    expect(markdown).toContain('— Outing, 0 miles, 0 feet climbed');
    expect(markdown).not.toContain('odometer');
    expect(markdown).not.toContain('## Biggest climbs');
    expect(markdown).not.toContain('## Longest rides');
  });

  it('returns the unavailable stub without history or when loading fails', async () => {
    const stub = '# Big map\n\n> Strava history is unavailable right now.\n';

    jest.mocked(getStravaHistory).mockResolvedValueOnce(null);
    await expect(getStravaMarkdown()).resolves.toBe(stub);

    jest.mocked(getStravaHistory).mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(getStravaMarkdown()).resolves.toBe(stub);
  });
});
