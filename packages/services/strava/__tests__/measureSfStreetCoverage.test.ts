import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import { measureStreetCoverage } from '../measureSfStreetCoverage';
import { encodePolyline, type StreetGrid } from '../streetGridGeometry';

const NOW = new Date('2026-10-22T12:00:00Z');
const ORIGIN = { lat: 37.76, lng: -122.44 };

/** Whole-meter points every 10 m from `from` to `to`. */
const street = (from: [number, number], to: [number, number]) =>
  encodePolyline(
    Array.from({ length: 11 }, (_, step): [number, number] => [
      from[0] + ((to[0] - from[0]) * step) / 10,
      from[1] + ((to[1] - from[1]) * step) / 10,
    ]),
  );

/** One 100 m east-west street in Ashbury and one 100 m north-south street in Bernal. */
const GRID: StreetGrid = {
  neighborhoods: [
    { name: 'Ashbury', outline: 'M0 0l10 0 0 10z', streets: street([0, 0], [100, 0]) },
    { name: 'Bernal', outline: 'M0 -60l10 0 0 10z', streets: street([0, 500], [0, 600]) },
  ],
  origin: ORIGIN,
  viewBox: '0 -60 20 70',
};

/** A Strava-style polyline through grid meters. */
const route = (...points: Array<[number, number]>) =>
  encodePolyline(
    points.map(([x, y]): [number, number] => [
      Math.round((ORIGIN.lat + y / 110_574) * 1e5),
      Math.round((ORIGIN.lng + x / (111_320 * Math.cos((ORIGIN.lat * Math.PI) / 180))) * 1e5),
    ]),
  );

const outing = (
  id: number,
  polyline: string | null,
  overrides: Partial<StravaLogEntry> = {},
): StravaLogEntry => ({
  distanceMeters: 1000,
  elevationGainMeters: 0,
  id,
  movingTimeSeconds: 600,
  name: `Outing ${id}`,
  polyline,
  sport: 'ride',
  startDate: '2026-10-20T15:00:00Z',
  url: `https://www.strava.com/activities/${id}`,
  ...overrides,
});

describe('measureStreetCoverage', () => {
  it('measures each neighborhood’s street length and keeps its outline', () => {
    const coverage = measureStreetCoverage(GRID, [], NOW);
    expect(coverage.viewBox).toBe('0 -60 20 70');
    expect(coverage.neighborhoods).toEqual([
      { name: 'Ashbury', outline: 'M0 0l10 0 0 10z', streetMeters: 100 },
      { name: 'Bernal', outline: 'M0 -60l10 0 0 10z', streetMeters: 100 },
    ]);
    expect(coverage.ridden).toEqual({});
  });

  it('counts a street ridden along within reach, and only that street', () => {
    const coverage = measureStreetCoverage(GRID, [outing(1, route([-20, 8], [120, 8]))], NOW);
    expect(coverage.ridden['all all']).toEqual([100, 0]);
  });

  it('ignores routes that cross a street or pass beyond reach', () => {
    const crossing = outing(1, route([50, -100], [50, 100]));
    const parallel = outing(2, route([-20, 30], [120, 30]));
    expect(measureStreetCoverage(GRID, [crossing, parallel], NOW).ridden).toEqual({});
  });

  it('counts pieces ridden by several outings once and partial passes in part', () => {
    const coverage = measureStreetCoverage(
      GRID,
      [
        outing(1, route([-20, 0], [120, 0])),
        outing(2, route([120, -5], [-20, -5])),
        outing(3, route([0, 480], [0, 545])),
      ],
      NOW,
    );
    const [ashbury, bernal] = coverage.ridden['all all'] ?? [];
    expect(ashbury).toBe(100);
    expect(bernal).toBeGreaterThan(40);
    expect(bernal).toBeLessThan(80);
  });

  it('keys ridden meters by sport and span, leaving out filters that cover nothing', () => {
    const coverage = measureStreetCoverage(
      GRID,
      [
        outing(1, route([-20, 0], [120, 0])),
        outing(2, route([0, 480], [0, 620]), { sport: 'run', startDate: '2024-06-01T18:00:00Z' }),
        outing(3, route([-20, 0], [120, 0]), { sport: 'other', startDate: '2025-02-01T00:00:00Z' }),
        outing(4, null, { sport: 'hike' }),
      ],
      NOW,
    );
    expect(coverage.ridden).toEqual({
      'all 2024': [0, 100],
      'all 2025': [100, 0],
      'all 2026': [100, 0],
      'all all': [100, 100],
      'all month': [100, 0],
      'all week': [100, 0],
      'ride 2026': [100, 0],
      'ride all': [100, 0],
      'ride month': [100, 0],
      'ride week': [100, 0],
      'run 2024': [0, 100],
      'run all': [0, 100],
    });
  });

  it('ends rolling windows at the summary time', () => {
    const coverage = measureStreetCoverage(
      GRID,
      [outing(1, route([-20, 0], [120, 0]), { startDate: '2026-10-01T12:00:00Z' })],
      NOW,
    );
    expect(coverage.ridden['all month']).toEqual([100, 0]);
    expect(coverage.ridden['all week']).toBeUndefined();
  });
});
