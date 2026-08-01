import type { Track } from '@dg/content-models/spotify/Track';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

// Simulates environments without `waitUntil` (Vercel PPR resume, ISR
// revalidation, dynamic RSC renders): any `after()` call throws Next error
// E91 there. `getLatestSong` runs inside 'use cache', so calling `after()`
// from it fatally breaks the homepage stream (truncated HTML shell, 0-byte
// /index.rsc, "Connection closed" in the browser).
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
import { getLatestSong } from '../spotify';

const track = { id: 'track-1', name: 'Test Song' } as Track;

describe('getLatestSong', () => {
  it('resolves the latest track even where after() is unavailable', async () => {
    jest.mocked(fetchRecentlyPlayed).mockResolvedValue(track);
    await expect(getLatestSong()).resolves.toBe(track);
  });

  it('returns null when tokens are missing', async () => {
    jest.mocked(fetchRecentlyPlayed).mockRejectedValue(new MissingTokenError('spotify'));
    await expect(getLatestSong()).resolves.toBeNull();
  });
});
