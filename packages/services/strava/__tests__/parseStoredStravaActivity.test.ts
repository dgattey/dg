import { parseStoredStravaActivity } from '../parseStoredStravaActivity';

describe('parseStoredStravaActivity', () => {
  it('reads a camelCase row and keeps fields the schema does not name', () => {
    const activity = parseStoredStravaActivity(
      {
        athleteNote: 'kept',
        id: 1,
        map: { summaryPolyline: 'abc' },
        sportType: 'GravelRide',
        startDate: '2026-03-01T16:00:00Z',
        type: 'Ride',
      },
      new Date('2020-01-01T00:00:00Z'),
    );

    expect(activity).toMatchObject({
      athleteNote: 'kept',
      id: 1,
      map: { summaryPolyline: 'abc' },
      name: 'Strava Activity',
      sportType: 'GravelRide',
      startDate: '2026-03-01T16:00:00Z',
      url: 'https://www.strava.com/activities/1',
    });
  });

  it('maps a legacy snake_case row to the domain shape', () => {
    const activity = parseStoredStravaActivity(
      {
        id: 2,
        map: { summary_polyline: 'xyz' },
        name: 'Old ride',
        sport_type: 'Ride',
        start_date: '2019-05-01T12:00:00Z',
        total_elevation_gain: 120,
        type: 'Ride',
      },
      null,
    );

    expect(activity).toMatchObject({
      id: 2,
      map: { summaryPolyline: 'xyz' },
      name: 'Old ride',
      sportType: 'Ride',
      startDate: '2019-05-01T12:00:00Z',
      totalElevationGain: 120,
    });
  });

  it('fills a missing start date from the indexed column', () => {
    expect(
      parseStoredStravaActivity({ id: 3, type: 'Run' }, new Date('2024-07-04T08:00:00Z'))
        ?.startDate,
    ).toBe('2024-07-04T08:00:00.000Z');
    expect(parseStoredStravaActivity({ id: 3, type: 'Run' }, '2024-07-04')?.startDate).toBe(
      '2024-07-04',
    );
  });

  it('returns null for payloads that are not activities', () => {
    expect(parseStoredStravaActivity(null, new Date())).toBeNull();
    expect(parseStoredStravaActivity('ride', new Date())).toBeNull();
    expect(parseStoredStravaActivity({ name: 'No id or type' }, new Date())).toBeNull();
  });
});
