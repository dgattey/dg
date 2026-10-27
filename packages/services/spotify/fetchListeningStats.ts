import 'server-only';

import type { PeriodStatus } from '@dg/shared-core/dates/periodStatus';
import type { StatsRange } from '@dg/shared-core/dates/statsRange';
import { log } from '@dg/shared-core/logging/log';
import { buildRangeBreakdowns } from './listeningStatsBreakdowns';
import {
  mapCatalogSlices,
  resolveAlbums,
  resolveArtists,
  toStatsGenres,
  toStatsTracks,
} from './listeningStatsCatalog';
import { ALL_TIME_FILTER, rangePlayFilter } from './listeningStatsFilters';
import { buildLoyalty, loyaltyUnit, monthIndex, type StatsLoyalty } from './listeningStatsLoyalty';
import { findNewArtists } from './listeningStatsNewArtists';
import { statsNow } from './listeningStatsPhase';
import { fetchTopPlaylistRows, toStatsPlaylists } from './listeningStatsPlaylists';
import { type StatsPopularity, selectYearlyPopularity } from './listeningStatsPopularity';
import {
  selectAlbumSessions,
  selectArtistDepth,
  selectBucketTopTracks,
  selectDailyPlays,
  selectDayHourPlays,
  selectDayStreak,
  selectLatestPlayedAt,
  selectLocalBuckets,
  selectMonthlyPlays,
  selectRepeats,
  selectSummary,
  selectTopAlbumIds,
  selectTopGenres,
  selectTopTrackIds,
} from './listeningStatsQueries';
import type { SpotifyLink } from './spotifyLinks';
import { resolveTrackDisplays } from './trackDisplays';

const FALLBACK_MINUTES_PER_PLAY = 3.81;
const TOP_ALBUMS = 3;
const TOP_TRACKS = 6;
const TOP_DEPTH_ARTISTS = 8;
const ON_REPEAT_TRACKS = 6;

/** An album with its cover, flagged when it is one of the favorite albums so links open it there. */
export type StatsAlbumRef = SpotifyLink & { imageUrl: string; isFavorite: boolean };
export type StatsAlbum = StatsAlbumRef & { artists: Array<SpotifyLink> };
export type StatsTrack = SpotifyLink & { album: StatsAlbumRef; artists: Array<SpotifyLink> };
export type StatsTopTrack = StatsTrack & { plays: number };
/** `active` counts the artist's days or months with a play, in the range's `loyalty` unit. */
export type StatsTopArtist = SpotifyLink & { active: number; plays: number; tracks: number };
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
export type StatsPhase = PeriodStatus;
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
  /** A spacer that pads a calendar row outside the range, with no plays of its own. */
  blank?: true;
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
  artists: number;
  champions: StatsChampions;
  dayStreak: { days: number; end: string; start: string };
  firstPlayedAt: string;
  frontToBack: Array<{ album: StatsAlbum; plays: number; sessionPlays: number; sessions: number }>;
  genres: Array<StatsGenre>;
  hours: Array<number>;
  lastPlayedAt: string;
  loyalty: StatsLoyalty;
  matrix: StatsMatrix;
  minutesPerPlay: number;
  monthStreak: { end: string; months: number; start: string };
  newArtists: { ids: Array<string>; label: string };
  onRepeat: Array<{ plays: number; track: StatsTrack; week: string }>;
  plays: number;
  /** Popularity of what was played each year, on the all-time range only. */
  popularity: StatsPopularity | null;
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
  const { end, length, start } = longestRun(months, monthIndex);
  return { end, months: length, start };
}

export function longestDayStreak(days: ReadonlyArray<string>): ListeningStats['dayStreak'] {
  const { end, length, start } = longestRun(days, (day) =>
    Math.round(Date.parse(`${day}T00:00:00Z`) / 86_400_000),
  );
  return { days: length, end, start };
}

function sumYearsFromMonths(
  monthlyPlays: ReadonlyArray<{ month: number; plays: number; year: number }>,
): Array<{ plays: number; year: number }> {
  const byYear = new Map<number, number>();
  for (const row of monthlyPlays) {
    byYear.set(row.year, (byYear.get(row.year) ?? 0) + row.plays);
  }
  return [...byYear.entries()].sort(([a], [b]) => a - b).map(([year, plays]) => ({ plays, year }));
}

export async function fetchListeningStats(
  range: StatsRange = { kind: 'all' },
  options?: {
    knownYears?: Array<{ plays: number; year: number }>;
    /** Pacific `YYYY-MM-DD` whose calendar month `month` covers; defaults to the latest play's day. */
    today?: string;
  },
): Promise<ListeningStats | null> {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) return null;
  try {
    const latestPlayedAt = await selectLatestPlayedAt();
    if (!latestPlayedAt) return null;
    const now = statsNow(latestPlayedAt);
    const today = options?.today ?? now.day;
    const month = today.slice(0, 7);
    const filter = rangePlayFilter(range, latestPlayedAt, month);
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
      rawYears,
      monthlyPlays,
      hours,
      dailyPlays,
      [allTimeDayStreak],
      dayHourPlays,
      topAlbumIds,
      topTrackIds,
      bucketTopTracks,
      sessions,
      onRepeat,
      depth,
      playlistRows,
      popularity,
    ] = await Promise.all([
      selectSummary(filter),
      options?.knownYears || range.kind === 'all'
        ? Promise.resolve(null)
        : selectLocalBuckets('year'),
      range.kind === 'all' ? selectMonthlyPlays() : Promise.resolve([]),
      selectLocalBuckets('hour', filter),
      range.kind === 'all' ? Promise.resolve([]) : selectDailyPlays(filter),
      range.kind === 'all' ? selectDayStreak(filter) : Promise.resolve([]),
      range.kind === 'week' ? selectDayHourPlays(filter) : Promise.resolve([]),
      selectTopAlbumIds(filter),
      selectTopTrackIds(filter),
      selectBucketTopTracks(championUnit, filter),
      selectAlbumSessions(filter),
      selectRepeats(repeatUnit, ON_REPEAT_TRACKS, filter),
      selectArtistDepth(loyaltyUnit(range), filter),
      fetchTopPlaylistRows(filter),
      range.kind === 'all' ? selectYearlyPopularity() : Promise.resolve(null),
    ]);

    if (!summary?.firstPlayedAt || !summary.lastPlayedAt || summary.plays === 0) return null;

    const years =
      options?.knownYears ??
      (range.kind === 'all'
        ? sumYearsFromMonths(monthlyPlays)
        : (rawYears ?? []).map((row) => ({ plays: row.plays, year: row.bucket })));
    const activeMonthKeys =
      range.kind === 'all'
        ? monthlyPlays.map((row) => `${row.year}-${String(row.month).padStart(2, '0')}`)
        : [...new Set(dailyPlays.map((row) => row.day.slice(0, 7)))];
    const spanDays =
      range.kind === 'week'
        ? 7
        : range.kind === 'month'
          ? Number(today.slice(8, 10))
          : (summary.spanDays ?? 1);

    const shownAlbums = topAlbumIds.slice(0, TOP_ALBUMS);
    const shownTracks = topTrackIds.slice(0, TOP_TRACKS);
    const directAlbumIds = [...new Set([...shownAlbums, ...sessions].map((row) => row.albumId))];
    const [trackDisplays, artistMap] = await Promise.all([
      resolveTrackDisplays([
        ...[...shownTracks, ...onRepeat, ...bucketTopTracks].map((row) => row.trackId),
        ...playlistRows.map((row) => row.topTrackId),
      ]),
      resolveArtists(depth.map((row) => row.artistId)),
    ]);

    const { albums, favoriteIds } = await resolveAlbums(
      directAlbumIds,
      [...trackDisplays.values()].map((track) => track.album.id),
    );
    const tracks = toStatsTracks(trackDisplays, favoriteIds);
    const topPlaylists = toStatsPlaylists(playlistRows, tracks);
    const genres = toStatsGenres(await selectTopGenres(filter));

    const minutesPerPlay =
      summary.knownPlays > 0
        ? summary.knownMs / summary.knownPlays / 60_000
        : FALLBACK_MINUTES_PER_PLAY;

    const { champions, matrix, timeline } = buildRangeBreakdowns({
      bucketTopTracks,
      dailyPlays,
      dayHourPlays,
      month,
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
    const newArtists = await findNewArtists(shownArtistIds, range, filter ?? ALL_TIME_FILTER, now);

    return {
      activeDays: summary.activeDays,
      artists: summary.artists,
      champions,
      dayStreak:
        range.kind === 'all'
          ? (allTimeDayStreak ?? { days: 0, end: '', start: '' })
          : longestDayStreak(dailyPlays.map((row) => row.day)),
      ...slices,
      firstPlayedAt: summary.firstPlayedAt.toISOString(),
      genres,
      hours: Array.from(
        { length: 24 },
        (_, hour) => hours.find((row) => row.bucket === hour)?.plays ?? 0,
      ),
      lastPlayedAt: summary.lastPlayedAt.toISOString(),
      loyalty: buildLoyalty({ activeMonthKeys, range, spanDays, summary, today }),
      matrix,
      minutesPerPlay,
      monthStreak: longestMonthStreak(activeMonthKeys),
      newArtists,
      plays: summary.plays,
      popularity,
      range,
      sessionPlays: sessions[0]?.totalSessionPlays ?? 0,
      sessions: sessions[0]?.totalSessions ?? 0,
      shelf: { albums: summary.shelfAlbums, plays: summary.shelfPlays },
      spanDays,
      timeline,
      topPlaylists,
      tracks: summary.tracks,
      years,
    };
  } catch (error) {
    log.warn('Could not fetch listening stats from database', { error, range });
    return null;
  }
}
