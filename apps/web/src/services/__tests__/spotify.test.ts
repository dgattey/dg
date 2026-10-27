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

jest.mock('@dg/services/spotify/trackTempo', () => ({
  getTrackBpm: jest.fn(),
}));

import { fetchRecentlyPlayed } from '@dg/services/spotify/fetchRecentlyPlayed';
import { getTrackBpm } from '@dg/services/spotify/trackTempo';
import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { cacheLife } from 'next/cache';
import { getLastKnownSong, getLatestSong } from '../spotify';

const track = { id: 'track-1', name: 'Test Song' } as Track;
const trackWithIsrc = { ...track, isrc: 'USQX91300809' } as Track;

describe('getLatestSong', () => {
  beforeEach(() => {
    jest.mocked(cacheLife).mockClear();
    jest.mocked(getTrackBpm).mockReset();
  });

  it('fetches the live track directly without Next use-cache stale windows', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLatestSong()).resolves.toBe(track);
    expect(cacheLife).not.toHaveBeenCalled();
    expect(getTrackBpm).not.toHaveBeenCalled();
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLatestSong()).resolves.toBeNull();
  });

  it('attaches the stored or looked-up tempo without a Next cache layer', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(getTrackBpm).mockResolvedValue(116.13);
    await expect(getLatestSong()).resolves.toEqual({ ...trackWithIsrc, bpm: 116.13 });
    expect(getTrackBpm).toHaveBeenCalledWith('USQX91300809');
    expect(cacheLife).not.toHaveBeenCalled();
  });

  it('leaves the tempo unknown when there is none', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(getTrackBpm).mockResolvedValue(null);
    await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
  });

  it('still returns the track when the stored tempo read fails', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(trackWithIsrc);
    jest.mocked(getTrackBpm).mockRejectedValue(new Error('database unavailable'));
    await expect(getLatestSong()).resolves.toBe(trackWithIsrc);
  });
});

describe('getLastKnownSong', () => {
  beforeEach(() => {
    jest.mocked(cacheLife).mockClear();
    jest.mocked(getTrackBpm).mockReset();
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
    jest.mocked(getTrackBpm).mockResolvedValue(98);
    await expect(getLastKnownSong()).resolves.toEqual({ ...trackWithIsrc, bpm: 98 });
  });
});
