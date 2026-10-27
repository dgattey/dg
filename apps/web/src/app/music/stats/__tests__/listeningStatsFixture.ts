import type {
  ListeningStats,
  StatsAlbum,
  StatsTrack,
} from '@dg/services/spotify/fetchListeningStats';

const artist = (id: string, name = `Artist ${id}`) => ({
  id,
  name,
  url: `https://open.spotify.com/artist/${id}`,
});

const album = (id: string, isFavorite = false): StatsAlbum => ({
  artists: [artist(`by-${id}`)],
  id,
  imageUrl: `https://i.scdn.co/image/${id}`,
  isFavorite,
  name: `Album ${id}`,
  url: `https://open.spotify.com/album/${id}`,
});

const track = (id: string, name = `Track ${id}`, by = artist(`by-${id}`)): StatsTrack => ({
  album: album(`of-${id}`),
  artists: [by],
  id,
  name,
  url: `https://open.spotify.com/track/${id}`,
});

const hours = Array.from({ length: 24 }, (_, hour) => 100 + hour);
hours[15] = 25_806;
hours[16] = 25_500;

/** An all-time snapshot the stats page tests start from and override per range. */
export const stats: ListeningStats = {
  activeDays: 90,
  artists: 12,
  champions: {
    aside: '#1 song each year',
    entries: [
      {
        badge: '2012',
        key: '2012',
        track: {
          ...track('line-of-sight', 'Line Of Sight', artist('odesza', 'ODESZA')),
          plays: 62,
        },
        yearFilter: 2012,
      },
    ],
    title: 'Soundtrack by year',
  },
  dayStreak: { days: 14, end: '2024-03-14', start: '2024-03-01' },
  firstPlayedAt: '2011-07-29T19:00:00.000Z',
  frontToBack: [{ album: album('dreamland'), plays: 100, sessionPlays: 87, sessions: 7 }],
  genres: [
    {
      artists: [artist('burna', 'Burna Boy'), artist('fireboy', 'Fireboy DML')],
      genre: 'afrobeats',
      plays: 420,
      tracks: 28,
    },
    {
      artists: [artist('odesza', 'ODESZA'), artist('tycho', 'Tycho')],
      genre: 'chillwave',
      plays: 310,
      tracks: 19,
    },
  ],
  hours,
  lastPlayedAt: '2026-08-07T19:00:00.000Z',
  loyalty: { active: 4, possible: 6, unit: 'month' },
  matrix: {
    columns: [
      { full: 'Jan', key: 'Jan', short: 'J' },
      { full: 'Jul', key: 'Jul', short: 'J' },
      { full: 'Aug', key: 'Aug', short: 'A' },
    ],
    peakCell: { key: '2012-03', label: 'Mar 2012', plays: 600 },
    rows: [
      {
        cells: [
          { key: '2011-01', label: 'Jan 2011', phase: 'past', plays: 0, yearFilter: 2011 },
          { key: '2011-07', label: 'Jul 2011', phase: 'past', plays: 180, yearFilter: 2011 },
          { key: '2011-08', label: 'Aug 2011', phase: 'current', plays: 220, yearFilter: 2011 },
        ],
        key: '2011',
        label: '’11',
        yearFilter: 2011,
      },
    ],
    title: 'Every month',
  },
  minutesPerPlay: 3.92,
  monthStreak: { end: '2011-10', months: 4, start: '2011-07' },
  newArtists: { ids: ['fireboy'], label: 'New artist this year' },
  onRepeat: [{ plays: 36, track: track('jet-pack'), week: '2017-05-29' }],
  plays: 1_000,
  popularity: {
    firstCapturedOn: '2012-06-01',
    source: 'spotify',
    years: [
      { atPlayShare: 0, popularity: 41.2, scoredShare: 0.9, year: 2011 },
      { atPlayShare: 0.8, popularity: 63, scoredShare: 1, year: 2012 },
    ],
  },
  range: { kind: 'all' },
  sessionPlays: 240,
  sessions: 30,
  shelf: { albums: 3, plays: 80 },
  spanDays: 100,
  timeline: {
    points: [
      { key: '2011', label: '2011', phase: 'past', plays: 400, tick: '’11', yearFilter: 2011 },
      { key: '2012', label: '2012', phase: 'current', plays: 600, tick: '’12', yearFilter: 2012 },
      { key: '2013', label: '2013', phase: 'future', plays: 0, tick: '’13', yearFilter: 2013 },
    ],
    title: 'Plays per year',
  },
  topAlbums: [
    { album: album('apart', true), plays: 120 },
    { album: album('rush'), plays: 90 },
    { album: album('avalanche'), plays: 80 },
  ],
  topArtists: [
    {
      active: 4,
      id: 'artist-burna',
      name: 'Burna Boy',
      plays: 400,
      tracks: 20,
      url: 'https://open.spotify.com/artist/burna',
    },
    {
      active: 3,
      id: 'artist-odesza',
      name: 'ODESZA',
      plays: 280,
      tracks: 14,
      url: 'https://open.spotify.com/artist/odesza',
    },
  ],
  topPlaylists: [
    {
      id: 'playlist-pumped',
      imageUrl: 'https://image-cdn-fa.spotifycdn.com/image/pumped',
      name: '#pumped',
      playedTracks: 84,
      plays: 1_420,
      topTrack: track('line-of-sight', 'Line Of Sight', artist('odesza', 'ODESZA')),
      totalTracks: 100,
      url: 'https://open.spotify.com/playlist/playlist-pumped',
    },
    {
      id: 'playlist-glue',
      imageUrl: 'https://mosaic.scdn.co/640/glue',
      name: 'Glue',
      playedTracks: 62,
      plays: 980,
      topTrack: track('breathe-deeper', 'Breathe Deeper', artist('tame', 'Tame Impala')),
      totalTracks: 148,
      url: 'https://open.spotify.com/playlist/playlist-glue',
    },
  ],
  topTracks: [
    { ...track('line-of-sight', 'Line Of Sight', artist('odesza', 'ODESZA')), plays: 94 },
    { ...track('breathe-deeper', 'Breathe Deeper', artist('tame', 'Tame Impala')), plays: 78 },
  ],
  tracks: 300,
  years: [
    { plays: 400, year: 2011 },
    { plays: 600, year: 2012 },
  ],
};
