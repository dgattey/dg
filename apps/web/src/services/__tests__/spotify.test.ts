import type { Track } from '@dg/content-models/spotify/Track';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  after: jest.fn(() => {
    throw new Error(
      '`after()` will not work correctly, because `waitUntil` is not available in the current environment.',
    );
  }),
}));

jest.mock('@dg/services/spotify/fetchRecentlyPlayed', () => ({
  fetchRecentlyPlayed: jest.fn(),
}));

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { cacheLife } from 'next/cache';
import { getLastKnownSong, getLatestSong } from '../spotify';

const track = { id: 'track-1', name: 'Test Song' } as Track;

describe('getLatestSong', () => {
  beforeEach(() => {
    jest.mocked(cacheLife).mockClear();
  });

  it('fetches the live track directly without Next use-cache stale windows', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLatestSong()).resolves.toBe(track);
    expect(cacheLife).not.toHaveBeenCalled();
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLatestSong()).resolves.toBeNull();
  });
});

describe('getLastKnownSong', () => {
  it('caches the prerendered shell track with max lifetime', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLastKnownSong()).resolves.toBe(track);
    expect(cacheLife).toHaveBeenLastCalledWith('max');
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLastKnownSong()).resolves.toBeNull();
  });
});
