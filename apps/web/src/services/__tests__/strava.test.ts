import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import type { StravaHistory, StravaOuting } from '@dg/content-models/strava/StravaHistory';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

jest.mock('@dg/services/strava/fetchLatestStravaActivityFromDb', () => ({
  fetchLatestStravaActivityFromDb: jest.fn(),
}));

jest.mock('@dg/services/strava/fetchStravaHistoryFromDb', () => ({
  fetchStravaHistoryFromDb: jest.fn(),
}));

import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { getLatestActivity, getStravaHistory } from '../strava';

const activity: StravaActivity = {
  id: 1,
  name: 'Morning ride',
  startDate: '2026-02-08T12:00:00Z',
  type: 'Ride',
  url: 'https://www.strava.com/activities/1',
};

const outing: StravaOuting = {
  description: null,
  distanceMeters: 1000,
  elevationGainMeters: 10,
  id: 1,
  movingTimeSeconds: 300,
  name: 'Morning ride',
  polyline: null,
  sport: 'ride',
  startDate: '2026-02-08T12:00:00.000Z',
  url: 'https://www.strava.com/activities/1',
};

const { description: _, ...entry } = outing;

const history: StravaHistory = {
  bikes: [],
  latest: outing,
  outings: [entry],
  streetCoverage: {
    sd: {
      neighborhoods: [],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: {},
      viewBox: '0 0 10 10',
    },
    sf: {
      neighborhoods: [],
      projection: { origin: { lat: 0, lng: 0 }, perDegree: { lat: -1, lng: 1 } },
      ridden: {},
      viewBox: '0 0 10 10',
    },
  },
  thisYear: { distanceMeters: 1000, elevationGainMeters: 10, outings: 1, year: 2026 },
  totals: { distanceMeters: 1000, elevationGainMeters: 10, firstYear: 2026, outings: 1 },
};

describe('getLatestActivity', () => {
  it('returns the stored activity without baking in a relative time', async () => {
    jest.mocked(fetchLatestStravaActivityFromDb).mockResolvedValue(activity);
    const result = await getLatestActivity();
    expect(result).toEqual(activity);
    expect(result).not.toHaveProperty('relativeStartDate');
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchLatestStravaActivityFromDb).mockRejectedValue(new MissingTokenError('strava'));
    await expect(getLatestActivity()).resolves.toBeNull();
  });
});

describe('getStravaHistory', () => {
  it('returns the stored history', async () => {
    jest.mocked(fetchStravaHistoryFromDb).mockResolvedValue(history);
    await expect(getStravaHistory()).resolves.toEqual(history);
  });

  it('returns null when there is no history or tokens are missing', async () => {
    jest.mocked(fetchStravaHistoryFromDb).mockResolvedValueOnce(null);
    await expect(getStravaHistory()).resolves.toBeNull();
    jest.mocked(fetchStravaHistoryFromDb).mockRejectedValueOnce(new MissingTokenError('strava'));
    await expect(getStravaHistory()).resolves.toBeNull();
  });
});
