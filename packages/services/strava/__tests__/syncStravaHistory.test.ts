import { Op } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { setupMockLifecycle } from '@dg/testing/mocks';
import { parseStoredStravaActivity } from '../parseStoredStravaActivity';
import { syncStravaHistory } from '../syncStravaHistory';

type MockResponse = {
  response: { json: () => Promise<unknown> };
  retryAfterSeconds?: number;
  status: number;
};

const mockStravaGet = jest.fn<Promise<MockResponse>, [string]>();

jest.mock('../stravaClient', () => ({
  getStravaClient: () => ({ get: mockStravaGet }),
}));

const BASE_ID = 9_100_000_000;

const summary = (n: number, overrides: Record<string, unknown> = {}) => ({
  distance: 1000 * n,
  gear_id: 'b-summary',
  id: BASE_ID + n,
  map: { id: `a${n}`, resource_state: 2, summary_polyline: `summary-${n}` },
  name: `Summary ${n}`,
  sport_type: 'GravelRide',
  start_date: new Date(Date.UTC(2020, 0, 1) + n * 86_400_000).toISOString(),
  total_elevation_gain: 12,
  type: 'Ride',
  ...overrides,
});

const summaries = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => summary(from + i));

const ok = (items: Array<unknown>): MockResponse => ({
  response: { json: async () => items },
  status: 200,
});

const pageResource = (page: number) => `athlete/activities?per_page=200&page=${page}`;

const servePages = (pages: Array<MockResponse>) => {
  mockStravaGet.mockImplementation(
    async (resource) => pages.find((_, i) => resource === pageResource(i + 1)) ?? ok([]),
  );
};

describe('syncStravaHistory', () => {
  const db = setupTestDatabase();
  setupMockLifecycle();

  const storedIds = { [Op.gte]: BASE_ID, [Op.lt]: BASE_ID + 1000 };
  const readRow = async (n: number) => {
    const row = await db.StravaActivity.findOne({ where: { id: BASE_ID + n } });
    return {
      activity: parseStoredStravaActivity(row?.activityData, row?.activityStartDate),
      lastUpdate: row?.lastUpdate ?? null,
    };
  };

  it('pages until a short page and stores every new activity', async () => {
    servePages([ok(summaries(1, 200)), ok(summaries(201, 3))]);

    await expect(syncStravaHistory()).resolves.toEqual({
      inserted: 203,
      pages: 2,
      status: 'ok',
      updated: 0,
    });

    expect(mockStravaGet.mock.calls.map(([resource]) => resource)).toEqual([
      pageResource(1),
      pageResource(2),
    ]);
    expect(await db.StravaActivity.count({ where: { id: storedIds } })).toBe(203);
    const row = await db.StravaActivity.findOne({ where: { id: BASE_ID + 203 } });
    expect(row?.activityStartDate).toEqual(new Date(summary(203).start_date));
    expect(row?.lastUpdate).toBeNull();
    expect(row?.activityData).toMatchObject({
      gearId: 'b-summary',
      map: { summaryPolyline: 'summary-203' },
      name: 'Summary 203',
      sportType: 'GravelRide',
    });
    expect(row?.activityData).not.toHaveProperty('summary_polyline');
  });

  it('fills only missing route, sport, and gear on rows that already exist', async () => {
    const lastUpdate = new Date('2026-01-01T00:00:00Z');
    await db.StravaActivity.bulkCreate([
      {
        activityData: {
          description: 'From the detailed fetch',
          id: BASE_ID + 1,
          map: { polyline: 'full-resolution' },
          name: 'Detailed name',
          startDate: summary(1).start_date,
          type: 'Ride',
        },
        activityStartDate: new Date(summary(1).start_date),
        id: BASE_ID + 1,
        lastUpdate,
      },
      {
        activityData: {
          gearId: 'b-detailed',
          id: BASE_ID + 2,
          map: { summaryPolyline: 'detailed-summary' },
          name: 'Complete',
          sportType: 'Ride',
          startDate: summary(2).start_date,
          type: 'Ride',
        },
        activityStartDate: new Date(summary(2).start_date),
        id: BASE_ID + 2,
      },
      {
        activityData: {
          id: BASE_ID + 3,
          name: 'Legacy row',
          start_date: summary(3).start_date,
          type: 'Ride',
        },
        activityStartDate: new Date(summary(3).start_date),
        id: BASE_ID + 3,
      },
    ]);
    servePages([ok(summaries(1, 3))]);

    await expect(syncStravaHistory()).resolves.toEqual({
      inserted: 0,
      pages: 1,
      status: 'ok',
      updated: 2,
    });

    const detailed = await readRow(1);
    expect(detailed.lastUpdate).toEqual(lastUpdate);
    expect(detailed.activity).toMatchObject({
      description: 'From the detailed fetch',
      gearId: 'b-summary',
      map: { polyline: 'full-resolution', summaryPolyline: 'summary-1' },
      name: 'Detailed name',
      sportType: 'GravelRide',
    });
    expect((await readRow(2)).activity).toMatchObject({
      gearId: 'b-detailed',
      map: { summaryPolyline: 'detailed-summary' },
      name: 'Complete',
      sportType: 'Ride',
    });
    expect((await readRow(3)).activity).toMatchObject({
      map: { summaryPolyline: 'summary-3' },
      name: 'Legacy row',
      sportType: 'GravelRide',
    });
  });

  it('changes nothing on a second run', async () => {
    await db.StravaActivity.create({
      activityData: { id: BASE_ID + 1, name: 'Sparse', type: 'Ride' },
      activityStartDate: new Date(summary(1).start_date),
      id: BASE_ID + 1,
    });
    servePages([ok([summary(1, { map: { summary_polyline: '' } }), ...summaries(2, 2)])]);

    await expect(syncStravaHistory()).resolves.toMatchObject({ inserted: 2, updated: 1 });
    const afterFirst = await db.StravaActivity.findAll({
      order: [['id', 'ASC']],
      where: { id: storedIds },
    });

    await expect(syncStravaHistory()).resolves.toEqual({
      inserted: 0,
      pages: 1,
      status: 'ok',
      updated: 0,
    });
    const afterSecond = await db.StravaActivity.findAll({
      order: [['id', 'ASC']],
      where: { id: storedIds },
    });
    expect(afterSecond.map((row) => row.activityData)).toEqual(
      afterFirst.map((row) => row.activityData),
    );
  });

  it('stops at a rate limit and keeps the pages already saved', async () => {
    servePages([
      ok(summaries(1, 200)),
      { response: { json: async () => ({}) }, retryAfterSeconds: 900, status: 429 },
    ]);

    await expect(syncStravaHistory()).resolves.toEqual({
      inserted: 200,
      pages: 1,
      reason: 'Strava rate limit reached on page 2',
      retryAfterSeconds: 900,
      status: 'failed',
      updated: 0,
    });
    expect(mockStravaGet).toHaveBeenCalledTimes(2);
    expect(await db.StravaActivity.count({ where: { id: storedIds } })).toBe(200);
  });

  it('reports other failed reads without storing anything', async () => {
    servePages([{ response: { json: async () => ({}) }, status: 500 }]);

    await expect(syncStravaHistory()).resolves.toEqual({
      inserted: 0,
      pages: 0,
      reason: 'Strava returned 500 for page 1',
      retryAfterSeconds: undefined,
      status: 'failed',
      updated: 0,
    });
    expect(await db.StravaActivity.count({ where: { id: storedIds } })).toBe(0);
  });
});
