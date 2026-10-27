import { dbClient } from '@dg/db';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchListeningStats, longestDayStreak, longestMonthStreak } from '../fetchListeningStats';

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
const PLAYLIST_ID = '0h6rMwAevgcAKLASUoeuU8';

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
  play('2023-11-12T20:00:00Z', 'ls-track-1'),
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
  await dbClient.query(
    'LOCK TABLE "SpotifyPlay", "FavoriteAlbum", "MusicPlaylist" IN ACCESS EXCLUSIVE MODE',
  );
  await dbClient.query('DELETE FROM "SpotifyPlay"');
  await dbClient.query('DELETE FROM "FavoriteAlbum"');
  await dbClient.query('DELETE FROM "MusicPlaylist"');
}

async function seedCatalog() {
  await db.MusicArtist.create({
    genres: ['chillwave', 'chillstep'],
    id: ARTIST,
    name: 'ODESZA',
    url: 'https://open.spotify.com/artist/cached',
  });
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
    artistNames: 'ODESZA',
    id: ALBUM,
    imageUrl: 'https://image.test/shelf.jpg',
    name: 'Shelf album',
    primaryArtist: 'ODESZA',
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

  it('degrades to null when the database rejects queries', async () => {
    const querySpy = jest
      .spyOn(dbClient, 'query')
      .mockRejectedValueOnce(new Error('Neon network transfer limit exceeded'));
    try {
      await expect(fetchListeningStats()).resolves.toBeNull();
    } finally {
      querySpy.mockRestore();
    }
  });

  it('aggregates plays in Pacific time with sessions, repeats, genres, top tracks, top artists, and depth', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate(
      plays.map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    );
    mockSpotifyGet.mockImplementation((resource: string) => {
      if (resource === `artists/${GUEST}`) {
        return Promise.resolve({
          data: {
            external_urls: { spotify: 'https://open.spotify.com/artist/guest' },
            genres: ['afrobeats'],
            id: GUEST,
            name: 'Burna Boy',
          },
          status: 200,
          success: true,
        });
      }
      if (resource.startsWith('me/playlists?')) {
        return Promise.resolve({
          data: {
            items: [
              {
                external_urls: { spotify: `https://open.spotify.com/playlist/${PLAYLIST_ID}` },
                id: PLAYLIST_ID,
                images: [{ height: 640, url: 'https://mosaic.scdn.co/640/pumped', width: 640 }],
                name: '#pumped',
                owner: { id: 'dylangattey' },
                tracks: { total: 10 },
              },
            ],
            next: null,
          },
          status: 200,
          success: true,
        });
      }
      if (resource.startsWith(`playlists/${PLAYLIST_ID}/tracks?`)) {
        return Promise.resolve({
          data: {
            items: [{ track: { id: REPEAT_TRACK } }],
            next: null,
          },
          status: 200,
          success: true,
        });
      }
      return Promise.resolve({ error: 'HTTP 404', status: 404, success: false });
    });

    const stats = await fetchListeningStats();

    expect(stats).toMatchObject({
      activeDays: 8,
      artists: 2,
      dayStreak: { days: 4, end: '2024-03-08', start: '2024-03-05' },
      firstPlayedAt: '2023-11-12T20:00:00.000Z',
      frontToBack: [
        {
          album: {
            artists: [
              { id: 'ODESZA', name: 'ODESZA', url: 'https://open.spotify.com/search/ODESZA' },
            ],
            isFavorite: true,
            name: 'Shelf album',
          },
          plays: 10,
          sessionPlays: 9,
          sessions: 1,
        },
      ],
      genres: [
        {
          artists: [{ id: ARTIST, name: 'ODESZA', url: 'https://open.spotify.com/artist/cached' }],
          genre: 'chillwave',
          plays: 14,
          tracks: 7,
        },
        {
          artists: [{ id: GUEST, name: 'Burna Boy', url: 'https://open.spotify.com/artist/guest' }],
          genre: 'afrobeats',
          plays: 4,
          tracks: 1,
        },
      ],
      lastPlayedAt: '2024-05-01T20:00:00.000Z',
      loyalty: { active: 5, possible: 7, unit: 'month' },
      minutesPerPlay: 3,
      monthStreak: { end: '2024-03', months: 3, start: '2024-01' },
      newArtists: { ids: [GUEST], label: 'New artist this year' },
      onRepeat: [{ plays: 4, track: { name: 'Repeat me' }, week: '2024-03-04' }],
      plays: 14,
      range: { kind: 'all' },
      sessionPlays: 9,
      sessions: 1,
      shelf: { albums: 1, plays: 10 },
      spanDays: 172,
      topPlaylists: [
        {
          id: PLAYLIST_ID,
          imageUrl: 'https://mosaic.scdn.co/640/pumped',
          name: '#pumped',
          playedTracks: 1,
          plays: 4,
          topTrack: {
            id: REPEAT_TRACK,
            name: 'Repeat me',
            url: 'https://open.spotify.com/track/repeat',
          },
          totalTracks: 10,
          url: `https://open.spotify.com/playlist/${PLAYLIST_ID}`,
        },
      ],
      tracks: 7,
      years: [
        { plays: 1, year: 2023 },
        { plays: 13, year: 2024 },
      ],
    });
    expect(stats?.topAlbums.map((row) => [row.album.name, row.plays])).toEqual([
      ['Shelf album', 10],
    ]);
    expect(stats?.topTracks).toEqual([
      {
        album: {
          id: SINGLES,
          imageUrl: 'https://image.test/singles.jpg',
          isFavorite: false,
          name: 'Singles',
          url: `https://open.spotify.com/album/${SINGLES}`,
        },
        artists: [{ id: ARTIST, name: 'ODESZA', url: 'https://open.spotify.com/artist/cached' }],
        id: REPEAT_TRACK,
        name: 'Repeat me',
        plays: 4,
        url: 'https://open.spotify.com/track/repeat',
      },
    ]);
    expect(stats?.topArtists).toEqual([
      {
        active: 5,
        id: ARTIST,
        name: 'ODESZA',
        plays: 14,
        tracks: 7,
        url: 'https://open.spotify.com/artist/cached',
      },
      {
        active: 1,
        id: GUEST,
        name: 'Burna Boy',
        plays: 4,
        tracks: 1,
        url: 'https://open.spotify.com/artist/guest',
      },
    ]);
    expect(stats?.timeline).toMatchObject({
      points: [
        { key: '2023', label: '2023', phase: 'past', plays: 1, tick: '’23', yearFilter: 2023 },
        { key: '2024', label: '2024', phase: 'current', plays: 13, tick: '’24', yearFilter: 2024 },
      ],
      title: 'Plays per year',
    });
    expect(stats?.matrix).toMatchObject({
      peakCell: { key: '2024-03', label: 'Mar 2024', plays: 10 },
      title: 'Every month',
    });
    expect(stats?.champions).toEqual({
      aside: '#1 song each year',
      entries: [
        {
          badge: '2024',
          key: '2024',
          track: {
            album: {
              id: SINGLES,
              imageUrl: 'https://image.test/singles.jpg',
              isFavorite: false,
              name: 'Singles',
              url: `https://open.spotify.com/album/${SINGLES}`,
            },
            artists: [
              { id: ARTIST, name: 'ODESZA', url: 'https://open.spotify.com/artist/cached' },
            ],
            id: REPEAT_TRACK,
            name: 'Repeat me',
            plays: 4,
            url: 'https://open.spotify.com/track/repeat',
          },
          yearFilter: 2024,
        },
      ],
      title: 'Soundtrack by year',
    });
    expect(stats?.hours[15]).toBe(6);
    expect(stats?.hours[19]).toBe(4);
    await expect(db.MusicArtist.findByPk(GUEST)).resolves.toMatchObject({ name: 'Burna Boy' });
    await expect(db.MusicPlaylist.findByPk(PLAYLIST_ID)).resolves.toMatchObject({
      name: '#pumped',
      totalTracks: 10,
      trackIds: [REPEAT_TRACK],
    });
  });

  it('filters stats by specific year and adapts timeline, matrix, and champions to monthly/weekly granularity', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate(
      plays.map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    );

    const stats2024 = await fetchListeningStats({ kind: 'year', year: 2024 });
    expect(stats2024).toMatchObject({
      activeDays: 7,
      champions: {
        aside: '#1 song each month in 2024',
        title: 'Soundtrack by month',
      },
      loyalty: { active: 4, possible: 5, unit: 'month' },
      matrix: {
        title: 'Every week of 2024',
      },
      newArtists: { ids: [], label: 'New artist this year' },
      plays: 13,
      range: { kind: 'year', year: 2024 },
      spanDays: 113,
      timeline: {
        title: 'Plays per month, 2024',
      },
      years: [
        { plays: 1, year: 2023 },
        { plays: 13, year: 2024 },
      ],
    });
    expect(stats2024?.timeline.points.map((point) => point.phase)).toEqual([
      ...Array.from({ length: 4 }, () => 'past'),
      'current',
      ...Array.from({ length: 7 }, () => 'future'),
    ]);

    const stats2023 = await fetchListeningStats({ kind: 'year', year: 2023 });
    expect(stats2023).toMatchObject({
      activeDays: 1,
      loyalty: { active: 1, possible: 12, unit: 'month' },
      newArtists: { ids: [ARTIST], label: 'New artist in 2023' },
      plays: 1,
      range: { kind: 'year', year: 2023 },
      spanDays: 1,
      years: [
        { plays: 1, year: 2023 },
        { plays: 13, year: 2024 },
      ],
    });
  });

  it('filters stats by the rolling week and calendar month and adapts breakdowns to days and shifts', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate(
      plays.map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    );

    const weekStats = await fetchListeningStats({ kind: 'week' });
    expect(weekStats).toMatchObject({
      activeDays: 1,
      champions: {
        aside: '#1 song each day',
        title: 'Soundtrack by day',
      },
      loyalty: { active: 1, possible: 7, unit: 'day' },
      matrix: {
        title: 'Every day & shift',
      },
      newArtists: { ids: [], label: 'New artist this week' },
      plays: 1,
      range: { kind: 'week' },
      spanDays: 7,
      timeline: {
        title: 'Plays per day, this week',
      },
      tracks: 1,
    });
    expect(weekStats?.timeline.points.map((point) => point.phase)).toEqual([
      ...Array.from({ length: 6 }, () => 'past'),
      'current',
    ]);

    const monthStats = await fetchListeningStats({ kind: 'month' });
    expect(monthStats).toMatchObject({
      activeDays: 1,
      champions: {
        aside: '#1 song each week',
        title: 'Soundtrack by week',
      },
      loyalty: { active: 1, possible: 1, unit: 'day' },
      matrix: {
        title: 'Every day, this month',
      },
      plays: 1,
      range: { kind: 'month' },
      spanDays: 1,
      timeline: {
        title: 'Plays per day, this month',
      },
      tracks: 1,
    });
    expect(monthStats?.timeline.points).toHaveLength(31);
    expect(monthStats?.timeline.points.map((point) => point.tick)).toEqual(
      monthStats?.timeline.points.map((point) => String(Number(point.key.slice(8, 10)))),
    );
  });

  it('scopes This month to the Pacific calendar month of today, not the last 30 days', async () => {
    await seedCatalog();
    await db.SpotifyPlay.bulkCreate(
      [
        play('2026-09-28T19:00:00Z', 'ls-track-1'),
        // 11:30 PM on 30 Sep in Los Angeles, though already 1 Oct in UTC.
        play('2026-10-01T06:30:00Z', 'ls-track-1'),
        play('2026-10-01T07:30:00Z', 'ls-track-2'),
        play('2026-10-10T19:00:00Z', 'ls-track-2'),
        play('2026-10-10T20:00:00Z', 'ls-track-3'),
        // 11:30 PM on 10 Oct in Los Angeles, though already 11 Oct in UTC.
        play('2026-10-11T06:30:00Z', 'ls-track-4'),
        play('2026-10-26T19:00:00Z', 'ls-track-3'),
      ].map((row) => ({ ...row, playedAt: new Date(row.playedAt) })),
    );

    const monthStats = await fetchListeningStats({ kind: 'month' }, { today: '2026-10-26' });
    const cells = monthStats?.matrix.rows.flatMap((row) => row.cells) ?? [];

    expect(monthStats).toMatchObject({
      activeDays: 3,
      loyalty: { active: 3, possible: 26, unit: 'day' },
      matrix: { peakCell: { key: '2026-10-10', label: 'Sat 10 Oct 2026', plays: 3 } },
      newArtists: { label: 'New artist this month' },
      plays: 5,
      spanDays: 26,
      topArtists: [{ active: 3, id: ARTIST, plays: 5 }],
    });
    expect(cells.filter((cell) => cell.blank).map((cell) => cell.key)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-11-01',
    ]);
    expect(cells.filter((cell) => cell.plays > 0).map((cell) => cell.key)).toEqual([
      '2026-10-01',
      '2026-10-10',
      '2026-10-26',
    ]);

    await expect(
      fetchListeningStats({ kind: 'month' }, { today: '2026-11-02' }),
    ).resolves.toBeNull();
  });
});

describe('streaks', () => {
  it('finds the longest run of consecutive months, across year boundaries', () => {
    expect(longestMonthStreak(['2023-11', '2023-12', '2024-01', '2024-03', '2024-04'])).toEqual({
      end: '2024-01',
      months: 3,
      start: '2023-11',
    });
    expect(longestMonthStreak([])).toEqual({ end: '', months: 0, start: '' });
  });

  it('finds the longest run of consecutive calendar days', () => {
    expect(longestDayStreak(['2024-02-28', '2024-02-29', '2024-03-01', '2024-03-03'])).toEqual({
      days: 3,
      end: '2024-03-01',
      start: '2024-02-28',
    });
    expect(longestDayStreak([])).toEqual({ days: 0, end: '', start: '' });
  });
});
