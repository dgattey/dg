import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

jest.mock('@dg/services/strava/fetchLatestStravaActivityFromDb', () => ({
  fetchLatestStravaActivityFromDb: jest.fn(),
}));

import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { getLatestActivity } from '../strava';

const activity: StravaActivity = {
  id: 1,
  name: 'Morning ride',
  startDate: '2026-02-08T12:00:00Z',
  type: 'Ride',
  url: 'https://www.strava.com/activities/1',
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
