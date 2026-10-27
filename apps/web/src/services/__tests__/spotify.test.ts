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

jest.mock('@dg/services/spotify/fetchTrackBpm', () => ({
  fetchTrackBpm: jest.fn(),
}));

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { fetchTrackBpm } from '@dg/services/spotify/fetchTrackBpm';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { cacheLife } from 'next/cache';
import { getLastKnownSong, getLatestSong } from '../spotify';

const track = { id: 'track-1', name: 'Test Song' } as Track;
const trackWithIsrc = { ...track, isrc: 'USQX91300809' } as Track;

describe('getLatestSong', () => {
  beforeEach(() => {
    jest.mocked(cacheLife).mockClear();
    jest.mocked(fetchTrackBpm).mockReset();
  });

  it('fetches the live track directly without Next use-cache stale windows', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLatestSong()).resolves.toBe(track);
    expect(cacheLife).not.toHaveBeenCalled();
    expect(fetchTrackBpm).not.toHaveBeenCalled();
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLatestSong()).resolves.toBeNull();
  });

  it('attaches the tempo looked up by ISRC behind a weeks-long cache', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(fetchTrackBpm).mockResolvedValue(116.13);
    await expect(getLatestSong()).resolves.toEqual({ ...trackWithIsrc, bpm: 116.13 });
    expect(fetchTrackBpm).toHaveBeenCalledWith('USQX91300809');
    expect(cacheLife).toHaveBeenCalledWith('weeks');
  });

  it('leaves the tempo unknown when the lookup has none', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(fetchTrackBpm).mockResolvedValue(null);
    await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
  });

  it('still returns the track when the tempo lookup fails', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(fetchTrackBpm).mockRejectedValue(new Error('network'));
    await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
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
