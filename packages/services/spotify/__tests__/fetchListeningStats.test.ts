import { dbClient } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchListeningStats, longestMonthStreak } from '../fetchListeningStats';

const mockSpotifyGet = jest.fn();

jest.mock('../trackMetadataShared', () => ({
  ...jest.requireActual('../trackMetadataShared'),
  spotifyGet: (...args: Array<unknown>) => mockSpotifyGet(...args),
}));

const db = setupTestDatabase();

const ALBUM = 'ls-album-shelf';
const SINGLES = 'ls-album-singles';
const ARTIST = 'ls-artist-cached';
const GUEST = 'ls-artist-guest';
const REPEAT_TRACK = 'ls-track-repeat';

type Play = { albumId: string; artistIds: Array<string>; playedAt: string; trackId: string };

const play = (playedAt: string, trackId: string, albumId = ALBUM, artistIds = [ARTIST]): Play => ({
  albumId,
  artistIds,
  playedAt,
  trackId,
});

/**
 * Six plays from one album, Tuesday 5 March 2024 from 3 PM Pacific. The January
 * and February plays from the same album run straight into it, so the session is 8 long.
 */
const session = Array.from({ length: 6 }, (_, i) =>
  play(`2024-03-05T23:${String(i * 4).padStart(2, '0')}:00Z`, `ls-track-${i + 1}`),
);

const plays: Array<Play> = [
  play('2024-01-10T20:00:00Z', 'ls-track-1'),
  play('2024-02-10T20:00:00Z', 'ls-track-2'),
  ...session,
  play('2024-03-06T03:00:00Z', REPEAT_TRACK, SINGLES, [ARTIST, GUEST]),
  play('2024-03-07T03:00:00Z', REPEAT_TRACK, SINGLES, [ARTIST, GUEST]),
  play('2024-03-08T03:00:00Z', REPEAT_TRACK, SINGLES, [ARTIST, GUEST]),
  play('2024-03-09T03:00:00Z', REPEAT_TRACK, SINGLES, [ARTIST, GUEST]),
  play('2024-05-01T20:00:00Z', 'ls-track-3'),
];

/**
 * The stats read every row, so other test files' committed plays would leak in.
 * Locking both tables inside this test's rolled-back transaction keeps the
 * aggregate to exactly what the test seeds.
 */
async function isolateTables() {
  await dbClient.query('LOCK TABLE "SpotifyPlay", "FavoriteAlbum" IN ACCESS EXCLUSIVE MODE');
  await dbClient.query('DELETE FROM "SpotifyPlay"');
  await dbClient.query('DELETE FROM "FavoriteAlbum"');
}

async function seedCatalog() {
  await db.MusicArtist.create({ id: ARTIST, name: 'Cached Artist', url: null });
  await db.MusicAlbum.create({
    id: SINGLES,
    imageUrl: 'https://image.test/singles.jpg',
    name: 'Singles',
    url: null,
  });
  await db.MusicTrack.create({
    albumId: SINGLES,
    durationMs: 180_000,
    id: REPEAT_TRACK,
    name: 'Repeat me',
    url: 'https://open.spotify.com/track/repeat',
  });
  await db.MusicTrackArtist.create({ artistId: ARTIST, position: 0, trackId: REPEAT_TRACK });
  await db.FavoriteAlbum.create({
    addedAt: '2024-01-01T00:00:00Z',
    artistNames: 'Cached Artist',
    id: ALBUM,
    imageUrl: 'https://image.test/shelf.jpg',
    name: 'Shelf album',
    primaryArtist: 'Cached Artist',
    releaseDate: '2020-01-01',
    url: 'https://open.spotify.com/album/shelf',
  });
}

describe('fetchListeningStats', () => {
  beforeEach(async () => {
    mockSpotifyGet.mockReset();
    mockSpotifyGet.mockResolvedValue({ error: 'HTTP 404', status: 404, success: false });
    await isolateTables();
  });

  it('returns null before anything is played', async () => {
    await expect(fetchListeningStats()).resolves.toBeNull();
  });

  it('aggregates plays in Pacific time with sessions, repeats, and depth', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate(
      plays.map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    );
    mockSpotifyGet.mockImplementation((resource: string) =>
      Promise.resolve(
        resource === `artists/${GUEST}`
          ? {
              data: {
                external_urls: { spotify: 'https://open.spotify.com/artist/guest' },
                id: GUEST,
                name: 'Guest Artist',
              },
              status: 200,
              success: true,
            }
          : { error: 'HTTP 404', status: 404, success: false },
      ),
    );

    const stats = await fetchListeningStats();

    expect(stats).toMatchObject({
      activeDays: 7,
      activeMonths: 4,
      artists: 2,
      dayRepeats: [],
      firstPlayedAt: '2024-01-10T20:00:00.000Z',
      frontToBack: [
        {
          album: { artistNames: 'Cached Artist', name: 'Shelf album' },
          plays: 9,
          sessionPlays: 8,
          sessions: 1,
        },
      ],
      lastPlayedAt: '2024-05-01T20:00:00.000Z',
      minutesPerPlay: 3,
      monthStreak: { end: '2024-03', months: 3, start: '2024-01' },
      onRepeat: [{ plays: 4, track: { name: 'Repeat me' }, week: '2024-03-04' }],
      plays: 13,
      sessionPlays: 8,
      sessions: 1,
      shelf: { albums: 1, plays: 9, topTenOnShelf: 1 },
      spanDays: 113,
      tracks: 7,
      years: [{ plays: 13, year: 2024 }],
    });
    expect(stats?.topAlbums.map((row) => [row.album.name, row.plays])).toEqual([
      ['Shelf album', 9],
    ]);
    expect(stats?.depth).toEqual([
      { months: 4, name: 'Cached Artist', plays: 13, tracks: 7 },
      { months: 1, name: 'Guest Artist', plays: 4, tracks: 1 },
    ]);
    expect(stats?.hours[15]).toBe(6);
    expect(stats?.hours[19]).toBe(4);
    // Monday first: the session and first repeat land on Tuesday, the rest Wednesday to Saturday.
    expect(stats?.weekdays).toEqual([0, 7, 3, 1, 1, 1, 0]);
    await expect(db.MusicArtist.findByPk(GUEST)).resolves.toMatchObject({ name: 'Guest Artist' });
  });

  it('filters aggregates to a single Pacific calendar year while preserving the full years list', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate([
      {
        ...play('2023-06-15T20:00:00Z', 'ls-track-2023'),
        playedAt: new Date('2023-06-15T20:00:00Z'),
      },
      ...plays.map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    ]);

    const stats2024 = await fetchListeningStats({ range: 'year', year: 2024 });
    expect(stats2024).toMatchObject({
      activeDays: 7,
      activeMonths: 4,
      plays: 13,
      tracks: 7,
      years: [
        { plays: 1, year: 2023 },
        { plays: 13, year: 2024 },
      ],
    });
  });
});

describe('longestMonthStreak', () => {
  it('finds the longest run of consecutive months, across year boundaries', () => {
    expect(longestMonthStreak(['2023-11', '2023-12', '2024-01', '2024-03', '2024-04'])).toEqual({
      end: '2024-01',
      months: 3,
      start: '2023-11',
    });
  });

  it('is empty with no months', () => {
    expect(longestMonthStreak([])).toEqual({ end: '', months: 0, start: '' });
  });
});
