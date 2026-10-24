import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchLatestStravaActivityFromDb } from '../fetchLatestStravaActivityFromDb';
import {
  fetchStravaHistoryFromDb,
  STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION,
} from '../fetchStravaHistoryFromDb';

const NOW = new Date('2026-10-22T12:00:00Z');

describe('fetchStravaHistoryFromDb', () => {
  const db = setupTestDatabase();

  it('returns null when no activities are stored', async () => {
    await expect(fetchStravaHistoryFromDb(NOW)).resolves.toBeNull();
  });

  it('degrades to null when the database query fails', async () => {
    const spy = jest
      .spyOn(db.StravaActivity, 'findAll')
      .mockRejectedValueOnce(new Error('Neon network transfer limit exceeded'));
    const oneSpy = jest
      .spyOn(db.StravaActivity, 'findOne')
      .mockRejectedValueOnce(new Error('Neon network transfer limit exceeded'));
    try {
      await expect(fetchStravaHistoryFromDb(NOW)).resolves.toBeNull();
      await expect(fetchLatestStravaActivityFromDb()).resolves.toBeNull();
    } finally {
      spy.mockRestore();
      oneSpy.mockRestore();
    }
  });

  it('summarizes canonical camelCase rows and skips unreadable ones', async () => {
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
          map: { summaryPolyline: 'trail' },
          name: 'Morning run',
          startDate: '2018-04-01T14:00:00Z',
          totalElevationGain: 80,
          type: 'Run',
          url: 'https://www.strava.com/activities/102',
        },
        activityStartDate: new Date('2018-04-01T14:00:00Z'),
        id: 102,
      },
      {
        activityData: {
          id: 103,
          name: 'Afternoon hike',
          startDate: '2022-07-04T17:00:00Z',
          type: 'Hike',
          url: 'https://www.strava.com/activities/103',
        },
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

    expect(history?.outings.map((outing) => [outing.id, outing.sport])).toEqual([
      [101, 'ride'],
      [103, 'hike'],
      [102, 'run'],
    ]);
    expect(history?.outings[1]?.startDate).toBe('2022-07-04T17:00:00.000Z');
    expect(history?.outings.map((outing) => outing.polyline)).toEqual(['camel', null, 'trail']);
    expect(history?.totals).toEqual({
      distanceMeters: 50_000,
      elevationGainMeters: 380,
      firstYear: 2018,
      outings: 3,
    });
    expect(history?.thisYear).toMatchObject({ outings: 1, year: 2026 });
    expect(history?.bikes).toEqual([
      {
        elevationGainMeters: 300,
        id: 'b1',
        longest: {
          distanceMeters: 40_000,
          name: 'Camel ride',
          startDate: '2026-09-01T15:00:00.000Z',
          url: 'https://www.strava.com/activities/101',
        },
        movingTimeSeconds: 0,
        name: 'Cruz',
        odometerMeters: 9_000_000,
        rides: 1,
        years: [
          {
            distanceMeters: 40_000,
            elevationGainMeters: 300,
            movingTimeSeconds: 0,
            rides: 1,
            year: 2026,
          },
        ],
      },
    ]);

    const cachedSummary = await db.StravaHistorySummary.findOne({ where: { singleton: true } });
    expect(cachedSummary?.activityCount).toBe(4);
    expect(Number(cachedSummary?.latestActivityId)).toBe(104);
    expect(cachedSummary?.schemaVersion).toBe(STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION);
    expect(cachedSummary?.payload?.polylines).toEqual(['camel', 'trail']);

    const findAllSpy = jest.spyOn(db.StravaActivity, 'findAll');
    try {
      const warmHistory = await fetchStravaHistoryFromDb(NOW);
      expect(findAllSpy).not.toHaveBeenCalled();
      expect(warmHistory).toEqual(history);
    } finally {
      findAllSpy.mockRestore();
    }
  });

  it('rebuilds the cached summary when schemaVersion or stored activities change', async () => {
    await db.StravaActivity.create({
      activityData: {
        distance: 12_000,
        id: 201,
        map: { summaryPolyline: 'loop-a' },
        name: 'First loop',
        startDate: '2026-10-10T15:00:00Z',
        type: 'Ride',
        url: 'https://www.strava.com/activities/201',
      },
      activityStartDate: new Date('2026-10-10T15:00:00Z'),
      id: 201,
    });

    const first = await fetchStravaHistoryFromDb(NOW);
    expect(first?.totals.outings).toBe(1);

    await db.StravaHistorySummary.update({ schemaVersion: 0 }, { where: { singleton: true } });
    const afterSchemaBump = await fetchStravaHistoryFromDb(NOW);
    expect(afterSchemaBump).toEqual(first);
    const refreshedRow = await db.StravaHistorySummary.findOne({ where: { singleton: true } });
    expect(refreshedRow?.schemaVersion).toBe(STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION);

    await db.StravaActivity.create({
      activityData: {
        distance: 8_000,
        id: 202,
        map: { summaryPolyline: 'loop-a' },
        name: 'Second loop',
        startDate: '2026-10-12T15:00:00Z',
        type: 'Ride',
        url: 'https://www.strava.com/activities/202',
      },
      activityStartDate: new Date('2026-10-12T15:00:00Z'),
      id: 202,
    });

    const afterInsert = await fetchStravaHistoryFromDb(NOW);
    expect(afterInsert?.totals.outings).toBe(2);
    expect(afterInsert?.totals.distanceMeters).toBe(20_000);
    const dedupedRow = await db.StravaHistorySummary.findOne({ where: { singleton: true } });
    expect(dedupedRow?.payload?.polylines).toEqual(['loop-a']);
  });
});
