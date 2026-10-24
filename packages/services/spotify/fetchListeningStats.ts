import 'server-only';

import { db } from '@dg/db';
import { buildRangeBreakdowns } from './listeningStatsBreakdowns';
import {
  mapCatalogSlices,
  resolveAlbums,
  resolveArtists,
  toStatsGenres,
  toStatsTracks,
} from './listeningStatsCatalog';
import { findNewArtists } from './listeningStatsNewArtists';
import { statsNow } from './listeningStatsPhase';
import { fetchTopPlaylistRows, toStatsPlaylists } from './listeningStatsPlaylists';
import {
  rollingDaysPlayFilter,
  type SqlPlayFilter,
  selectActiveMonths,
  selectAlbumSessions,
  selectArtistCount,
  selectArtistDepth,
  selectBucketTopTracks,
  selectDailyPlays,
  selectDayHourPlays,
  selectKnownDurations,
  selectLatestPlayedAt,
  selectLocalBuckets,
  selectMonthlyPlays,
  selectRepeats,
  selectShelf,
  selectSummary,
  selectTopAlbumIds,
  selectTopGenres,
  selectTopTrackIds,
  yearPlayFilter,
} from './listeningStatsQueries';
import type { SpotifyLink } from './spotifyLinks';
import { resolveTrackDisplays } from './trackDisplays';

const FALLBACK_MINUTES_PER_PLAY = 3.81;
const TOP_ALBUMS = 3;
const TOP_TRACKS = 6;
const TOP_DEPTH_ARTISTS = 8;
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

/** An album with its cover, flagged when it is one of the favorite albums so links open it there. */
export type StatsAlbumRef = SpotifyLink & { imageUrl: string; isFavorite: boolean };
export type StatsAlbum = StatsAlbumRef & { artists: Array<SpotifyLink> };
export type StatsTrack = SpotifyLink & { album: StatsAlbumRef; artists: Array<SpotifyLink> };
export type StatsTopTrack = StatsTrack & { plays: number };
export type StatsTopArtist = SpotifyLink & { months: number; plays: number; tracks: number };
export type StatsPlaylist = SpotifyLink & {
  imageUrl: string;
  playedTracks: number;
  plays: number;
  topTrack?: StatsTrack;
  totalTracks: number;
};
export type StatsGenre = {
  artists: Array<SpotifyLink>;
  genre: string;
  plays: number;
  tracks: number;
};
/** Where a calendar slot sits against the latest play: over, still in progress, or not yet happened. */
export type StatsPhase = 'current' | 'future' | 'past';
export type StatsTimelinePoint = {
  key: string;
  label: string;
  phase: StatsPhase;
  plays: number;
  tick: string;
  yearFilter?: number;
};
export type StatsTimeline = { points: Array<StatsTimelinePoint>; title: string };
export type StatsMatrixCell = {
  key: string;
  label: string;
  phase: StatsPhase;
  plays: number;
  yearFilter?: number;
};
export type StatsMatrixRow = {
  cells: Array<StatsMatrixCell>;
  key: string;
  label: string;
  yearFilter?: number;
};
export type StatsMatrix = {
  columns: Array<{ full: string; key: string; short: string }>;
  peakCell?: { key: string; label: string; plays: number };
  rows: Array<StatsMatrixRow>;
  title: string;
};
export type StatsChampionEntry = {
  badge: string;
  key: string;
  track: StatsTopTrack;
  yearFilter?: number;
};
export type StatsChampions = { aside: string; entries: Array<StatsChampionEntry>; title: string };

export type ListeningStats = {
  activeDays: number;
  activeMonths: number;
  artists: number;
  champions: StatsChampions;
  dayStreak: { days: number; end: string; start: string };
  firstPlayedAt: string;
  frontToBack: Array<{ album: StatsAlbum; plays: number; sessionPlays: number; sessions: number }>;
  genres: Array<StatsGenre>;
  hours: Array<number>;
  lastPlayedAt: string;
  matrix: StatsMatrix;
  minutesPerPlay: number;
  monthStreak: { end: string; months: number; start: string };
  newArtists: { ids: Array<string>; label: string };
  onRepeat: Array<{ plays: number; track: StatsTrack; week: string }>;
  plays: number;
  range: StatsRange;
  sessionPlays: number;
  sessions: number;
  shelf: { albums: number; plays: number };
  spanDays: number;
  timeline: StatsTimeline;
  topAlbums: Array<{ album: StatsAlbum; plays: number }>;
  topArtists: Array<StatsTopArtist>;
  topPlaylists: Array<StatsPlaylist>;
  topTracks: Array<StatsTopTrack>;
  tracks: number;
  years: Array<{ plays: number; year: number }>;
};

function longestRun(items: ReadonlyArray<string>, toIndex: (item: string) => number) {
  let best = { end: '', length: 0, start: '' };
  let runStart = 0;
  items.forEach((item, i) => {
    const previous = items[i - 1];
    if (previous === undefined || toIndex(item) - toIndex(previous) !== 1) {
      runStart = i;
    }
    const length = i - runStart + 1;
    if (length > best.length) {
      best = { end: item, length, start: items[runStart] ?? item };
    }
  });
  return best;
}

export function longestMonthStreak(months: ReadonlyArray<string>): ListeningStats['monthStreak'] {
  const { end, length, start } = longestRun(months, (month) => {
    const [year = 0, monthOfYear = 1] = month.split('-').map(Number);
    return year * 12 + monthOfYear - 1;
  });
  return { end, months: length, start };
}

export function longestDayStreak(days: ReadonlyArray<string>): ListeningStats['dayStreak'] {
  const { end, length, start } = longestRun(days, (day) =>
    Math.round(Date.parse(`${day}T00:00:00Z`) / 86_400_000),
  );
  return { days: length, end, start };
}

function fillBuckets(rows: Array<{ bucket: number; plays: number }>, size: number, first: number) {
  const buckets = Array.from({ length: size }, () => 0);
  for (const row of rows) {
    buckets[row.bucket - first] = row.plays;
  }
  return buckets;
}

function resolvePlayFilter(range: StatsRange, latest: Date): SqlPlayFilter | undefined {
  switch (range.kind) {
    case 'all':
      return undefined;
    case 'year':
      return yearPlayFilter(range.year);
    case 'week':
    case 'month':
      return rollingDaysPlayFilter(latest, range.kind === 'week' ? 7 : 30);
    default: {
      const unhandled: never = range;
      return unhandled;
    }
  }
}

export async function fetchListeningStats(
  range: StatsRange = { kind: 'all' },
  options?: { knownYears?: Array<{ plays: number; year: number }> },
): Promise<ListeningStats | null> {
  const latestPlayedAt = await selectLatestPlayedAt();
  if (!latestPlayedAt) return null;
  const filter = resolvePlayFilter(range, latestPlayedAt);
  const now = statsNow(latestPlayedAt);

  const championUnit =
    range.kind === 'all'
      ? 'year'
      : range.kind === 'year'
        ? 'month'
        : range.kind === 'month'
          ? 'week'
          : 'day';
  const repeatUnit = range.kind === 'week' ? 'day' : 'week';

  const [
    [summary],
    [artistCount],
    [durations],
    rawYears,
    monthlyPlays,
    hours,
    months,
    dailyPlays,
    dayHourPlays,
    topAlbumIds,
    topTrackIds,
    bucketTopTracks,
    [shelf],
    sessions,
    onRepeat,
    depth,
    favoriteAlbums,
    playlistResult,
  ] = await Promise.all([
    selectSummary(filter),
    selectArtistCount(filter),
    selectKnownDurations(filter),
    options?.knownYears ? Promise.resolve(null) : selectLocalBuckets('year'),
    range.kind === 'all' ? selectMonthlyPlays() : Promise.resolve([]),
    selectLocalBuckets('hour', filter),
    selectActiveMonths(filter),
    selectDailyPlays(filter),
    range.kind === 'week' ? selectDayHourPlays(filter) : Promise.resolve([]),
    selectTopAlbumIds(filter),
    selectTopTrackIds(filter),
    selectBucketTopTracks(championUnit, filter),
    selectShelf(filter),
    selectAlbumSessions(filter),
    selectRepeats(repeatUnit, ON_REPEAT_TRACKS, filter),
    selectArtistDepth(filter),
    db.FavoriteAlbum.findAll(),
    fetchTopPlaylistRows(filter),
  ]);

  if (!summary?.firstPlayedAt || !summary.lastPlayedAt || summary.plays === 0) return null;

  const years =
    options?.knownYears ?? (rawYears ?? []).map((row) => ({ plays: row.plays, year: row.bucket }));
  const favoriteIds = new Set(favoriteAlbums.map((album) => album.id));
  const shownAlbums = topAlbumIds.slice(0, TOP_ALBUMS);
  const shownTracks = topTrackIds.slice(0, TOP_TRACKS);
  const [albums, trackDisplays, artistMap] = await Promise.all([
    resolveAlbums(
      [...new Set([...shownAlbums, ...sessions].map((row) => row.albumId))],
      favoriteAlbums,
    ),
    resolveTrackDisplays([
      ...[...shownTracks, ...onRepeat, ...bucketTopTracks].map((row) => row.trackId),
      ...playlistResult.rows.map((row) => row.topTrackId),
    ]),
    resolveArtists(depth.map((row) => row.artistId)),
  ]);
  const tracks = toStatsTracks(trackDisplays, favoriteIds);
  const topPlaylists = toStatsPlaylists(playlistResult.rows, playlistResult.catalog, tracks);
  const genres = toStatsGenres(await selectTopGenres(filter));

  const minutesPerPlay =
    durations && durations.knownPlays > 0
      ? durations.knownMs / durations.knownPlays / 60_000
      : FALLBACK_MINUTES_PER_PLAY;

  const { champions, matrix, timeline } = buildRangeBreakdowns({
    bucketTopTracks,
    dailyPlays,
    dayHourPlays,
    monthlyPlays,
    now,
    range,
    tracks,
    years,
  });

  const slices = mapCatalogSlices({
    albums,
    artistMap,
    onRepeat,
    sessions,
    shownAlbums,
    shownTracks,
    topDepthRows: depth.slice(0, TOP_DEPTH_ARTISTS),
    tracks,
  });

  const shownArtistIds = new Set([
    ...slices.topArtists.map((artist) => artist.id),
    ...[...albums.values()].flatMap((album) => album.artists.map((artist) => artist.id)),
    ...[...tracks.values()].flatMap((track) => track.artists.map((artist) => artist.id)),
    ...genres.flatMap((genre) => genre.artists.map((artist) => artist.id)),
  ]);
  const newArtists = await findNewArtists(shownArtistIds, range, latestPlayedAt, now);

  return {
    activeDays: summary.activeDays,
    activeMonths: months.length,
    artists: artistCount?.artists ?? 0,
    champions,
    dayStreak: longestDayStreak(dailyPlays.map((row) => row.day)),
    ...slices,
    firstPlayedAt: summary.firstPlayedAt.toISOString(),
    genres,
    hours: fillBuckets(hours, 24, 0),
    lastPlayedAt: summary.lastPlayedAt.toISOString(),
    matrix,
    minutesPerPlay,
    monthStreak: longestMonthStreak(months.map((row) => row.month)),
    newArtists,
    plays: summary.plays,
    range,
    sessionPlays: sessions[0]?.totalSessionPlays ?? 0,
    sessions: sessions[0]?.totalSessions ?? 0,
    shelf: { albums: shelf?.albums ?? 0, plays: shelf?.plays ?? 0 },
    spanDays: range.kind === 'week' ? 7 : range.kind === 'month' ? 30 : (summary.spanDays ?? 1),
    timeline,
    topPlaylists,
    tracks: summary.tracks,
    years,
  };
}
