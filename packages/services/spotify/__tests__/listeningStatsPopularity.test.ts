import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { selectYearlyPopularity } from '../listeningStatsPopularity';

const db = setupTestDatabase();

const play = (trackId: string, playedAt: string) => ({
  albumId: 'album',
  artistIds: ['artist'],
  playedAt: new Date(playedAt),
  trackId,
});

beforeEach(async () => {
  await db.MusicTrackPopularity.destroy({ where: {} });
  await db.SpotifyPlay.destroy({ where: {} });
});

describe('selectYearlyPopularity', () => {
  it('returns null before any snapshot exists', async () => {
    await db.SpotifyPlay.create(play('a', '2020-05-01T12:00:00Z'));

    expect(await selectYearlyPopularity()).toBeNull();
  });

  it('weights by plays, reads at-play snapshots, and falls back to the earliest one', async () => {
    await db.SpotifyPlay.bulkCreate([
      play('hit', '2015-03-01T12:00:00Z'),
      play('hit', '2015-03-02T12:00:00Z'),
      play('deep-cut', '2015-06-01T12:00:00Z'),
      play('unscored', '2015-07-01T12:00:00Z'),
      // 23:30 on Dec 31, 2025 in Pacific time, which is 2026 in UTC.
      play('hit', '2026-01-01T07:30:00Z'),
      play('deep-cut', '2026-10-20T18:00:00Z'),
    ]);
    await db.MusicTrackPopularity.bulkCreate([
      { capturedOn: '2025-12-31', popularity: 90, source: 'spotify', trackId: 'hit' },
      { capturedOn: '2026-10-20', popularity: 20, source: 'spotify', trackId: 'deep-cut' },
      { capturedOn: '2026-10-25', popularity: 35, source: 'spotify', trackId: 'deep-cut' },
      { capturedOn: '2026-10-20', popularity: 99, source: 'deezer', trackId: 'unscored' },
    ]);

    const popularity = await selectYearlyPopularity();

    expect(popularity).toEqual({
      firstCapturedOn: '2025-12-31',
      source: 'spotify',
      years: [
        {
          atPlayShare: 0,
          popularity: Math.round(((90 + 90 + 20) / 3) * 10) / 10,
          scoredShare: 0.75,
          year: 2015,
        },
        { atPlayShare: 1, popularity: 90, scoredShare: 1, year: 2025 },
        { atPlayShare: 1, popularity: 20, scoredShare: 1, year: 2026 },
      ],
    });
  });

  it('uses Deezer only when no Spotify snapshot exists', async () => {
    await db.SpotifyPlay.create(play('a', '2020-05-01T12:00:00Z'));
    await db.MusicTrackPopularity.create({
      capturedOn: '2026-10-20',
      popularity: 44,
      source: 'deezer',
      trackId: 'a',
    });

    expect(await selectYearlyPopularity()).toMatchObject({
      source: 'deezer',
      years: [{ popularity: 44, year: 2020 }],
    });
  });
});
