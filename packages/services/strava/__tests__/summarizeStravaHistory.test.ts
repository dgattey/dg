import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { summarizeStravaHistory } from '../summarizeStravaHistory';

const NOW = new Date('2026-10-22T12:00:00Z');

const activity = ({
  id,
  ...overrides
}: Partial<StravaActivity> & Pick<StravaActivity, 'id'>): StravaActivity => ({
  id,
  name: `Outing ${id}`,
  type: 'Ride',
  url: `https://www.strava.com/activities/${id}`,
  ...overrides,
});

const history = [
  activity({
    distance: 30_000,
    gear: { distance: 7_828_686, id: 'b1', name: 'Cruz' },
    id: 1,
    map: { polyline: 'detailed1', summaryPolyline: 'summary1' },
    movingTime: 3600,
    sportType: 'GravelRide',
    startDate: '2026-03-14T16:00:00Z',
    totalElevationGain: 400,
  }),
  activity({
    description: '  Fog the whole way  ',
    distance: 8000,
    id: 2,
    map: { polyline: 'detailed2', summaryPolyline: '' },
    sportType: 'TrailRun',
    startDate: '2026-01-01T03:00:00Z',
    totalElevationGain: 250,
    type: 'Run',
  }),
  activity({
    distance: 120_000,
    gear: { distance: null, id: 'b2', name: 'Loaner' },
    id: 3,
    map: { summaryPolyline: 'summary3' },
    startDate: '2026-10-20T15:00:00Z',
    totalElevationGain: 1500,
  }),
  activity({
    distance: 5000,
    id: 4,
    sportType: 'Hike',
    startDate: '2024-06-01T18:00:00Z',
    totalElevationGain: 600,
    type: 'Hike',
  }),
  activity({
    distance: 2000,
    id: 5,
    map: { summaryPolyline: 'summary5' },
    startDate: '2025-12-31T23:30:00Z',
    type: 'Swim',
  }),
  activity({ id: 6, startDate: null }),
];

describe('summarizeStravaHistory', () => {
  const summary = summarizeStravaHistory(history, NOW);

  it('returns null when nothing has a start date', () => {
    expect(summarizeStravaHistory([], NOW)).toBeNull();
    expect(summarizeStravaHistory([activity({ id: 9, startDate: 'not a date' })], NOW)).toBeNull();
  });

  it('leaves out private and followers-only outings', () => {
    const hidden = [
      activity({ id: 10, private: true, startDate: '2026-10-21T12:00:00Z' }),
      activity({ id: 11, startDate: '2026-10-21T13:00:00Z', visibility: 'followers_only' }),
      activity({ id: 12, startDate: '2026-10-21T14:00:00Z', visibility: 'only_me' }),
    ];
    expect(summarizeStravaHistory(hidden, NOW)).toBeNull();
    const mixed = summarizeStravaHistory([...hidden, ...history], NOW);
    expect(mixed?.latest.id).toBe(3);
    expect(mixed?.totals.outings).toBe(summary?.totals.outings);
  });

  it('orders outings newest first and flattens the fields the views read', () => {
    expect(summary?.outings.map((outing) => outing.id)).toEqual([3, 1, 2, 5, 4]);
    expect(summary?.latest).toEqual({
      description: null,
      distanceMeters: 120_000,
      elevationGainMeters: 1500,
      id: 3,
      movingTimeSeconds: 0,
      name: 'Outing 3',
      polyline: 'summary3',
      sport: 'ride',
      startDate: '2026-10-20T15:00:00.000Z',
      url: 'https://www.strava.com/activities/3',
    });
    expect(summary?.outings[2]).toEqual({
      distanceMeters: 8000,
      elevationGainMeters: 250,
      id: 2,
      movingTimeSeconds: 0,
      name: 'Outing 2',
      polyline: 'detailed2',
      sport: 'run',
      startDate: '2026-01-01T03:00:00.000Z',
      url: 'https://www.strava.com/activities/2',
    });
  });

  it('keeps the latest outing’s note, trimmed', () => {
    const noted = summarizeStravaHistory(
      [activity({ description: '  Fog the whole way  ', id: 8, startDate: NOW.toISOString() })],
      NOW,
    );
    expect(noted?.latest.description).toBe('Fog the whole way');
  });

  it('maps Strava sport types onto the four sports', () => {
    const sports = (types: Array<Pick<StravaActivity, 'sportType' | 'type'>>) =>
      summarizeStravaHistory(
        types.map((type, i) => activity({ id: i + 1, startDate: NOW.toISOString(), ...type })),
        NOW,
      )
        ?.outings.toSorted((a, b) => a.id - b.id)
        .map((outing) => outing.sport);

    expect(
      sports([
        { type: 'Ride' },
        { type: 'EBikeRide' },
        { sportType: 'MountainBikeRide', type: 'Ride' },
        { sportType: 'VirtualRide', type: 'Ride' },
        { sportType: 'Velomobile', type: 'Ride' },
        { sportType: 'Handcycle', type: 'Handcycle' },
      ]),
    ).toEqual(['ride', 'ride', 'ride', 'ride', 'ride', 'ride']);
    expect(
      sports([
        { type: 'Run' },
        { sportType: 'TrailRun', type: 'Run' },
        { sportType: 'VirtualRun', type: 'Run' },
        { type: 'Hike' },
        { type: 'Walk' },
        { sportType: 'AlpineSki', type: 'AlpineSki' },
      ]),
    ).toEqual(['run', 'run', 'run', 'hike', 'hike', 'other']);
  });

  it('totals lifetime and this year', () => {
    expect(summary?.totals).toEqual({
      distanceMeters: 165_000,
      elevationGainMeters: 2750,
      firstYear: 2024,
      outings: 5,
    });
    expect(summary?.thisYear).toEqual({
      distanceMeters: 158_000,
      elevationGainMeters: 2150,
      outings: 3,
      year: 2026,
    });
  });

  it('names each bike from any ride that carries its gear and counts every ride on it', () => {
    const rides = [
      activity({
        gear: { distance: 9_000_000, id: 'b1', name: 'Cruz' },
        id: 20,
        startDate: '2026-10-01T10:00:00Z',
      }),
      activity({ gearId: 'b1', id: 21, startDate: '2023-08-12T10:00:00Z' }),
      activity({
        gear: { distance: 5_300_000, id: 'b2', name: 'Prince' },
        id: 22,
        startDate: '2026-10-20T10:00:00Z',
      }),
      activity({ gearId: 'b2', id: 23, startDate: '2024-07-26T10:00:00Z' }),
      activity({ gearId: 'b2', id: 24, startDate: '2025-05-01T10:00:00Z' }),
      activity({ gearId: 'b3', id: 25, startDate: '2021-01-01T10:00:00Z' }),
      activity({
        gear: { distance: 800_000, id: 'g4', name: 'Trail shoes' },
        id: 26,
        startDate: '2026-03-01T10:00:00Z',
        type: 'Run',
      }),
    ];

    expect(summarizeStravaHistory(rides, NOW)?.bikes).toEqual([
      {
        firstYear: 2023,
        id: 'b1',
        lastYear: 2026,
        name: 'Cruz',
        odometerMeters: 9_000_000,
        rides: 2,
      },
      {
        firstYear: 2024,
        id: 'b2',
        lastYear: 2026,
        name: 'Prince',
        odometerMeters: 5_300_000,
        rides: 3,
      },
    ]);
  });

  it('skips a named bike Strava reports no odometer for', () => {
    expect(summary?.bikes).toEqual([
      {
        firstYear: 2026,
        id: 'b1',
        lastYear: 2026,
        name: 'Cruz',
        odometerMeters: 7_828_686,
        rides: 1,
      },
    ]);
  });

  it('handles a sparse history with one old outing and nothing else', () => {
    const sparse = summarizeStravaHistory(
      [activity({ id: 7, startDate: '2023-04-02T09:00:00Z', type: 'Walk' })],
      NOW,
    );

    expect(sparse).toEqual({
      bikes: [],
      latest: expect.objectContaining({ distanceMeters: 0, id: 7, polyline: null, sport: 'hike' }),
      outings: [expect.objectContaining({ id: 7 })],
      thisYear: { distanceMeters: 0, elevationGainMeters: 0, outings: 0, year: 2026 },
      totals: { distanceMeters: 0, elevationGainMeters: 0, firstYear: 2023, outings: 1 },
    });
  });
});
