import 'server-only';

import { db } from '@dg/db';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import {
  buildYearChampions,
  resolveAlbums,
  resolveArtists,
  toStatsTopTrack,
} from './listeningStatsCatalog';
import {
  rollingDaysPlayFilter,
  type SqlPlayFilter,
  selectActiveDays,
  selectActiveMonths,
  selectAlbumSessions,
  selectArtistCount,
  selectArtistDepth,
  selectKnownDurations,
  selectLatestPlayedAt,
  selectLocalBuckets,
  selectMonthlyPlays,
  selectRepeats,
  selectShelf,
  selectSummary,
  selectTopAlbumIds,
  selectTopTrackIds,
  selectYearlyTopTracks,
  yearPlayFilter,
} from './listeningStatsQueries';
import { resolveTrackDisplays } from './trackDisplays';

const FALLBACK_MINUTES_PER_PLAY = 3.81;
const TOP_ALBUMS = 3;
const TOP_TRACKS = 6;
const ON_REPEAT_TRACKS = 6;

export type StatsRange =
  | { kind: 'all' }
  | { kind: 'month' }
  | { kind: 'week' }
  | { kind: 'year'; year: number };

export type StatsRangeKey = 'all' | 'month' | 'week' | `${number}`;

export function parseStatsRange(raw?: string | null): StatsRange {
  if (raw === 'week') return { kind: 'week' };
  if (raw === 'month') return { kind: 'month' };
  if (raw && /^(?:19|20)\d{2}$/.test(raw)) return { kind: 'year', year: Number(raw) };
  return { kind: 'all' };
}

export type StatsAlbum = {
  artistNames: string;
  id: string;
  imageUrl: string;
  name: string;
  url: string;
};

export type StatsTrack = {
  artistNames: string;
  id: string;
  name: string;
  url: string;
};

export type StatsTopTrack = {
  albumImageUrl: string;
  albumName: string;
  artistNames: string;
  id: string;
  name: string;
  plays: number;
  url: string;
};

export type StatsTopArtist = {
  id: string;
  months: number;
  name: string;
  plays: number;
  tracks: number;
  url: string;
};

export type StatsYearChampion = {
  track: StatsTopTrack;
  year: number;
};

export type ListeningStats = {
  activeDays: number;
  activeMonths: number;
  artists: number;
  dayStreak: { days: number; end: string; start: string };
  depth: Array<{ months: number; name: string; plays: number; tracks: number }>;
  firstPlayedAt: string;
  frontToBack: Array<{ album: StatsAlbum; plays: number; sessionPlays: number; sessions: number }>;
  hours: Array<number>;
  lastPlayedAt: string;
  minutesPerPlay: number;
  monthlyPlays: Array<{ month: number; plays: number; year: number }>;
  monthStreak: { end: string; months: number; start: string };
  onRepeat: Array<{ plays: number; track: StatsTrack; week: string }>;
  plays: number;
  range: StatsRange;
  sessionPlays: number;
  sessions: number;
  shelf: { albums: number; plays: number; topTenOnShelf: number };
  spanDays: number;
  topAlbums: Array<{ album: StatsAlbum; plays: number }>;
  topArtists: Array<StatsTopArtist>;
  topTracks: Array<StatsTopTrack>;
  tracks: number;
  weekdays: Array<number>;
  yearChampions: Array<StatsYearChampion>;
  years: Array<{ plays: number; year: number }>;
};

function monthIndex(month: string): number {
  const [year = 0, monthOfYear = 1] = month.split('-').map(Number);
  return year * 12 + monthOfYear - 1;
}

export function longestMonthStreak(months: ReadonlyArray<string>): ListeningStats['monthStreak'] {
  let best = { end: '', months: 0, start: '' };
  let runStart = 0;
  months.forEach((month, i) => {
    const previous = months[i - 1];
    if (previous === undefined || monthIndex(month) - monthIndex(previous) !== 1) {
      runStart = i;
    }
    const length = i - runStart + 1;
    if (length > best.months) {
      best = { end: month, months: length, start: months[runStart] ?? month };
    }
  });
  return best;
}

function dayIndex(day: string): number {
  return Math.round(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
}

export function longestDayStreak(days: ReadonlyArray<string>): ListeningStats['dayStreak'] {
  let best = { days: 0, end: '', start: '' };
  let runStart = 0;
  days.forEach((day, i) => {
    const previous = days[i - 1];
    if (previous === undefined || dayIndex(day) - dayIndex(previous) !== 1) {
      runStart = i;
    }
    const length = i - runStart + 1;
    if (length > best.days) {
      best = { days: length, end: day, start: days[runStart] ?? day };
    }
  });
  return best;
}

function fillBuckets(rows: Array<{ bucket: number; plays: number }>, size: number, first: number) {
  const buckets = Array.from({ length: size }, () => 0);
  for (const row of rows) {
    buckets[row.bucket - first] = row.plays;
  }
  return buckets;
}

async function resolvePlayFilter(range: StatsRange): Promise<SqlPlayFilter | undefined | null> {
  switch (range.kind) {
    case 'all':
      return undefined;
    case 'year':
      return yearPlayFilter(range.year);
    case 'week':
    case 'month': {
      const latest = await selectLatestPlayedAt();
      return latest ? rollingDaysPlayFilter(latest, range.kind === 'week' ? 7 : 30) : null;
    }
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

export async function fetchListeningStats(
  range: StatsRange = { kind: 'all' },
): Promise<ListeningStats | null> {
  const filter = await resolvePlayFilter(range);
  if (filter === null) return null;

  const [
    [summary],
    [artistCount],
    [durations],
    years,
    monthlyPlays,
    hours,
    weekdays,
    months,
    days,
    topAlbumIds,
    topTrackIds,
    yearlyTopTracks,
    [shelf],
    sessions,
    onRepeat,
    depth,
    favoriteAlbums,
  ] = await Promise.all([
    selectSummary(filter),
    selectArtistCount(filter),
    selectKnownDurations(filter),
    selectLocalBuckets('year'),
    selectMonthlyPlays(),
    selectLocalBuckets('hour', filter),
    selectLocalBuckets('isodow', filter),
    selectActiveMonths(filter),
    selectActiveDays(filter),
    selectTopAlbumIds(filter),
    selectTopTrackIds(filter),
    selectYearlyTopTracks(),
    selectShelf(filter),
    selectAlbumSessions(filter),
    selectRepeats('week', ON_REPEAT_TRACKS, filter),
    selectArtistDepth(filter),
    db.FavoriteAlbum.findAll(),
  ]);

  if (!summary?.firstPlayedAt || !summary.lastPlayedAt || summary.plays === 0) return null;

  const shelfIds = new Set(favoriteAlbums.map((album) => album.id));
  const shownAlbums = topAlbumIds.slice(0, TOP_ALBUMS);
  const shownTracks = topTrackIds.slice(0, TOP_TRACKS);
  const [albums, tracks, artistMap] = await Promise.all([
    resolveAlbums(
      [...new Set([...shownAlbums, ...sessions].map((row) => row.albumId))],
      favoriteAlbums,
    ),
    resolveTrackDisplays(
      [...shownTracks, ...onRepeat, ...yearlyTopTracks].map((row) => row.trackId),
    ),
    resolveArtists(depth.map((row) => row.artistId)),
  ]);

  const minutesPerPlay =
    durations && durations.knownPlays > 0
      ? durations.knownMs / durations.knownPlays / 60_000
      : FALLBACK_MINUTES_PER_PLAY;

  return {
    activeDays: summary.activeDays,
    activeMonths: months.length,
    artists: artistCount?.artists ?? 0,
    dayStreak: longestDayStreak(days.map((row) => row.day)),
    depth: depth
      .map(({ artistId, months: artistMonths, plays, tracks: artistTracks }) => {
        const artist = artistMap.get(artistId);
        return artist
          ? { months: artistMonths, name: artist.name, plays, tracks: artistTracks }
          : null;
      })
      .filter(isNotNullish),
    firstPlayedAt: summary.firstPlayedAt.toISOString(),
    frontToBack: sessions
      .map(({ albumId, plays, sessionPlays, sessions: count }) => {
        const album = albums.get(albumId);
        return album ? { album, plays, sessionPlays, sessions: count } : null;
      })
      .filter(isNotNullish),
    hours: fillBuckets(hours, 24, 0),
    lastPlayedAt: summary.lastPlayedAt.toISOString(),
    minutesPerPlay,
    monthlyPlays,
    monthStreak: longestMonthStreak(months.map((row) => row.month)),
    onRepeat: onRepeat
      .map(({ period, plays, trackId }) => {
        const track = tracks.get(trackId);
        return track
          ? {
              plays,
              track: {
                artistNames: track.artistNames,
                id: track.id,
                name: track.name,
                url: track.url,
              },
              week: period,
            }
          : null;
      })
      .filter(isNotNullish),
    plays: summary.plays,
    range,
    sessionPlays: sessions[0]?.totalSessionPlays ?? 0,
    sessions: sessions[0]?.totalSessions ?? 0,
    shelf: {
      albums: shelf?.albums ?? 0,
      plays: shelf?.plays ?? 0,
      topTenOnShelf: topAlbumIds.filter((row) => shelfIds.has(row.albumId)).length,
    },
    spanDays: range.kind === 'week' ? 7 : range.kind === 'month' ? 30 : (summary.spanDays ?? 1),
    topAlbums: shownAlbums
      .map(({ albumId, plays }) => {
        const album = albums.get(albumId);
        return album ? { album, plays } : null;
      })
      .filter(isNotNullish),
    topArtists: depth
      .map(({ artistId, months: artistMonths, plays, tracks: artistTracks }) => {
        const artist = artistMap.get(artistId);
        return artist
          ? {
              id: artistId,
              months: artistMonths,
              name: artist.name,
              plays,
              tracks: artistTracks,
              url: artist.url,
            }
          : null;
      })
      .filter(isNotNullish),
    topTracks: shownTracks
      .map(({ plays, trackId }) => toStatsTopTrack(tracks, trackId, plays))
      .filter(isNotNullish),
    tracks: summary.tracks,
    weekdays: fillBuckets(weekdays, 7, 1),
    yearChampions: buildYearChampions({
      tracks,
      yearlyTopTracks,
      years,
    }),
    years: years.map((row) => ({ plays: row.plays, year: row.bucket })),
  };
}
