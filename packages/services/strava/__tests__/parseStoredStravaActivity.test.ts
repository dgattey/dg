import { parseStoredStravaActivity } from '../parseStoredStravaActivity';

describe('parseStoredStravaActivity', () => {
  it('reads a canonical camelCase row and keeps fields the schema does not name', () => {
    const activity = parseStoredStravaActivity({
      athleteNote: 'kept',
      id: 1,
      map: { summaryPolyline: 'abc' },
      sportType: 'GravelRide',
      startDate: '2026-03-01T16:00:00Z',
      startDateLocal: '2026-03-01T08:00:00Z',
      type: 'Ride',
    });

    expect(activity).toMatchObject({
      athleteNote: 'kept',
      id: 1,
      map: { summaryPolyline: 'abc' },
      name: 'Strava Activity',
      sportType: 'GravelRide',
      startDate: '2026-03-01T16:00:00Z',
      startDateLocal: '2026-03-01T08:00:00Z',
      url: 'https://www.strava.com/activities/1',
    });
  });

  it('rejects legacy snake_case rows and rows missing startDate', () => {
    expect(
      parseStoredStravaActivity({
        id: 2,
        map: { summary_polyline: 'xyz' },
        name: 'Old ride',
        sport_type: 'Ride',
        start_date: '2019-05-01T12:00:00Z',
        type: 'Ride',
      }),
    ).toBeNull();
    expect(parseStoredStravaActivity({ id: 3, type: 'Run' })).toBeNull();
  });

  it('returns null for payloads that are not activities', () => {
    expect(parseStoredStravaActivity(null)).toBeNull();
    expect(parseStoredStravaActivity('ride')).toBeNull();
    expect(parseStoredStravaActivity({ name: 'No id or type' })).toBeNull();
  });
});
