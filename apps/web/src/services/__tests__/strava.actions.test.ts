jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock('../devConsoleAuth', () => ({
  withDevConsoleAuth: (action: () => unknown) => action(),
}));

jest.mock('@dg/services/strava/syncStravaHistory', () => ({
  syncStravaHistory: jest.fn(),
}));

import { syncStravaHistory } from '@dg/services/strava/syncStravaHistory';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { backfillStravaHistory } from '../strava.actions';

describe('backfillStravaHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports a finished run and revalidates history and the latest activity', async () => {
    jest
      .mocked(syncStravaHistory)
      .mockResolvedValue({ inserted: 203, pages: 2, status: 'ok', updated: 1 });

    await expect(backfillStravaHistory()).resolves.toEqual({
      message: '203 added, 1 updated, 2 pages read.',
      success: true,
    });
    expect(jest.mocked(revalidateTag).mock.calls).toEqual([
      ['strava-history', 'max'],
      ['latest-activity', 'max'],
    ]);
  });

  it('reports a rate-limited run with its progress and retry window', async () => {
    jest.mocked(syncStravaHistory).mockResolvedValue({
      inserted: 200,
      pages: 1,
      reason: 'Strava rate limit reached on page 2',
      retryAfterSeconds: 900,
      status: 'failed',
      updated: 0,
    });

    await expect(backfillStravaHistory()).resolves.toEqual({
      error:
        'Strava rate limit reached on page 2. 200 added, 0 updated, 1 page read. Retry in 900s.',
      success: false,
    });
    expect(revalidateTag).toHaveBeenCalledWith('strava-history', 'max');
  });

  it('turns a thrown error into a failed result', async () => {
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
    jest.mocked(syncStravaHistory).mockRejectedValue(new Error('Database unavailable'));

    await expect(backfillStravaHistory()).resolves.toEqual({
      error: 'Database unavailable',
      success: false,
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
