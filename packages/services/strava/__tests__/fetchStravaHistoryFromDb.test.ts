import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchStravaHistoryFromDb } from '../fetchStravaHistoryFromDb';

const NOW = new Date('2026-10-22T12:00:00Z');

describe('fetchStravaHistoryFromDb', () => {
  const db = setupTestDatabase();

  it('returns null when no activities are stored', async () => {
    await expect(fetchStravaHistoryFromDb(NOW)).resolves.toBeNull();
  });

  it('summarizes camelCase and legacy snake_case rows and skips unreadable ones', async () => {
    await db.StravaActivity.bulkCreate([
      {
        activityData: {
          distance: 40_000,
          gear: { distance: 9_000_000, id: 'b1', name: 'Cruz' },
          id: 101,
          map: { summaryPolyline: 'camel' },
          name: 'Camel ride',
          sportType: 'Ride',
          startDate: '2026-09-01T15:00:00Z',
          totalElevationGain: 300,
          type: 'Ride',
          url: 'https://www.strava.com/activities/101',
        },
        activityStartDate: new Date('2026-09-01T15:00:00Z'),
        id: 101,
      },
      {
        activityData: {
          distance: 10_000,
          id: 102,
          map: { summary_polyline: 'snake' },
          name: 'Snake run',
          start_date: '2018-04-01T14:00:00Z',
          total_elevation_gain: 80,
          type: 'Run',
        },
        activityStartDate: new Date('2018-04-01T14:00:00Z'),
        id: 102,
      },
      {
        activityData: { id: 103, type: 'Hike' },
        activityStartDate: new Date('2022-07-04T17:00:00Z'),
        id: 103,
      },
      {
        activityData: { name: 'Not an activity' },
        activityStartDate: new Date('2026-10-01T15:00:00Z'),
        id: 104,
      },
    ]);

    const history = await fetchStravaHistoryFromDb(NOW);

    expect(history?.recent.map((outing) => [outing.id, outing.sport])).toEqual([
      [101, 'ride'],
      [103, 'hike'],
      [102, 'run'],
    ]);
    expect(history?.recent[1]?.startDate).toBe('2022-07-04T17:00:00.000Z');
    expect(history?.routes.map((route) => route.polyline)).toEqual(['camel', 'snake']);
    expect(history?.totals).toEqual({
      distanceMeters: 50_000,
      elevationGainMeters: 380,
      firstYear: 2018,
      outings: 3,
    });
    expect(history?.thisYear).toMatchObject({ outings: 1, year: 2026 });
    expect(history?.odometer).toEqual({ distanceMeters: 9_000_000, gearName: 'Cruz' });
  });
});
