import type { StreetCoverage } from '@dg/content-models/strava/StreetCoverage';
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

const sfCoverage: StreetCoverage = {
  neighborhoods: [
    { name: 'Castro/Upper Market', outline: 'M0 0l10 0 0 10z', streetMeters: 16_093.44 },
    { name: 'Mission', outline: 'M10 0l10 0 0 10z', streetMeters: 32_186.88 },
    { name: 'Treasure Island', outline: 'M20 0l10 0 0 10z', streetMeters: 8046.72 },
  ],
  projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
  ridden: { 'all all': [8046.72, 24_140.16, 0], 'ride 2026': [0, 1609.344, 0] },
  viewBox: '0 0 30 10',
};

const noCoverage: StreetCoverage = { ...sfCoverage, neighborhoods: [], ridden: {} };

const history: StravaHistory = {
  bikes: [
    {
      elevationGainMeters: 125_578,
      id: 'b1',
      longest: {
        distanceMeters: 189_907,
        name: 'Marshall Wall Sunday',
        startDate: '2025-05-18T16:00:00.000Z',
        url: 'https://www.strava.com/activities/9',
      },
      movingTimeSeconds: 1_368_000,
      name: 'Cruz',
      odometerMeters: 7_828_686,
      rides: 399,
      years: [
        { distanceMeters: 2_000_000, year: 2023 },
        { distanceMeters: 5_828_686, year: 2026 },
      ],
    },
  ],
  latest: { ...latest, description: null },
  outings: [latest, hike],
  streetCoverage: { sd: noCoverage, sf: sfCoverage },
  thisYear: { distanceMeters: 16_093.44, elevationGainMeters: 304.8, outings: 1, year: 2026 },
  totals: {
    distanceMeters: 24_140.16,
    elevationGainMeters: 914.4,
    firstYear: 2025,
    outings: 2,
  },
};

describe('getStravaMarkdown', () => {
  it('lists totals, this year, yearly miles, recent activities, records, and bikes', async () => {
    jest.mocked(getStravaHistory).mockResolvedValue(history);

    const markdown = await getStravaMarkdown();

    expect(markdown).toContain('# Big map');
    expect(markdown).toContain('- 15 miles over 2 activities since 2025\n- 3,000 feet climbed');
    expect(markdown).toContain('## This year\n\n- 2026: 10 miles, 1,000 feet climbed, 1 activity');
    expect(markdown).toContain(
      '## Yearly miles\n\n- 2025: 5 miles (1 activity)\n- 2026: 10 miles (1 activity)',
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
      '## Bike odometers\n\n- Cruz: 4,864.5 miles on the odometer, 412,001 feet climbed, 380 hours in the saddle, 399 rides from 2023 to 2026, longest ride 118 miles, [Marshall Wall Sunday](https://www.strava.com/activities/9) on May 18, 2025',
    );
    expect(markdown).toContain(
      '## San Francisco street coverage\n\n- City: 57.1% of rideable streets, 20.0 of 35.0 miles, 2 of 3 neighborhoods explored\n- Mission: 75.0%, 15.0 of 20.0 miles\n- Castro / Upper Market: 50.0%, 5.0 of 10.0 miles\n\n',
    );
    expect(markdown).toContain('[Reading](/reading.md)');
    expect(markdown).not.toContain('[Big map](/activities.md)');
  });

  it('keeps a sparse history readable', async () => {
    const quiet = outing({ distanceMeters: 0, elevationGainMeters: 0, id: 3, sport: 'other' });
    jest.mocked(getStravaHistory).mockResolvedValue({
      ...history,
      bikes: [],
      latest: { ...quiet, description: null },
      outings: [quiet],
      streetCoverage: { sd: noCoverage, sf: { ...sfCoverage, ridden: {} } },
      thisYear: { distanceMeters: 0, elevationGainMeters: 0, outings: 0, year: 2026 },
    });

    const markdown = await getStravaMarkdown();

    expect(markdown).toContain('- No activities yet in 2026');
    expect(markdown).toContain('— Activity, 0 miles, 0 feet climbed');
    expect(markdown).not.toContain('odometer');
    expect(markdown).not.toContain('## Biggest climbs');
    expect(markdown).not.toContain('## Longest rides');
    expect(markdown).toContain(
      '- City: 0.0% of rideable streets, 0.0 of 35.0 miles, 0 of 3 neighborhoods explored\n\n',
    );
  });

  it('returns the unavailable stub without history or when loading fails', async () => {
    const stub = '# Big map\n\n> Strava history is unavailable right now.\n';

    jest.mocked(getStravaHistory).mockResolvedValueOnce(null);
    await expect(getStravaMarkdown()).resolves.toBe(stub);

    jest.mocked(getStravaHistory).mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(getStravaMarkdown()).resolves.toBe(stub);
  });
});
