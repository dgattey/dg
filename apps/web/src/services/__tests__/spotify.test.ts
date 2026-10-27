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
    expect(jest.mocked(cacheLife).mock.calls).toEqual([['weeks']]);
  });

  it('caches an unknown tempo for weeks too', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(fetchTrackBpm).mockResolvedValue(null);
    await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
    expect(jest.mocked(cacheLife).mock.calls).toEqual([['weeks']]);
  });

  it.each([
    ['times out', new DOMException('The operation timed out.', 'TimeoutError')],
    ['fails', new Error('network')],
  ])(
    'returns the track at the default tempo and caches for about an hour when Deezer %s',
    async (_label, error) => {
      jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
      jest.mocked(fetchTrackBpm).mockRejectedValue(error);
      await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
      expect(jest.mocked(cacheLife).mock.calls).toEqual([['hours']]);
    },
  );
});

describe('getLastKnownSong', () => {
  beforeEach(() => {
    jest.mocked(cacheLife).mockClear();
    jest.mocked(fetchTrackBpm).mockReset();
  });

  it('caches the prerendered shell track with max lifetime', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLastKnownSong()).resolves.toBe(track);
    expect(cacheLife).toHaveBeenLastCalledWith('max');
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLastKnownSong()).resolves.toBeNull();
  });

  it('attaches the tempo to the prerendered shell track', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(fetchTrackBpm).mockResolvedValue(98);
    await expect(getLastKnownSong()).resolves.toEqual({ ...trackWithIsrc, bpm: 98 });
  });
});
