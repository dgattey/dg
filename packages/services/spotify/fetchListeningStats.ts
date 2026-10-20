import 'server-only';

import { db, dbClient, Op, QueryTypes } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchAlbumDetail } from './fetchAlbumDetail';
import { resolveTrackDisplays } from './trackDisplays';
import { spotifyGet } from './trackMetadataShared';

/** Days, hours, and weeks are bucketed where the listening happened. */
const TIME_ZONE = 'America/Los_Angeles';
const LOCAL_PLAYED_AT = `("playedAt" AT TIME ZONE '${TIME_ZONE}')`;

/** A run of this many consecutive plays from one album counts as hearing it front to back. */
export const ALBUM_SESSION_MIN_PLAYS = 5;

/** Play-weighted mean track length, used until enough durations are cached. */
const FALLBACK_MINUTES_PER_PLAY = 3.81;

const TOP_ALBUM_CANDIDATES = 10;
const TOP_ALBUMS = 3;
const ON_REPEAT_TRACKS = 6;
const DAY_REPEAT_TRACKS = 2;
const FRONT_TO_BACK_ALBUMS = 4;
const DEPTH_ARTISTS = 8;

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

export type ListeningStats = {
  activeDays: number;
  activeMonths: number;
  artists: number;
  dayRepeats: Array<{ day: string; plays: number; track: StatsTrack }>;
  depth: Array<{ months: number; name: string; plays: number; tracks: number }>;
  firstPlayedAt: string;
  frontToBack: Array<{ album: StatsAlbum; plays: number; sessionPlays: number; sessions: number }>;
  /** Plays per local hour, midnight first. */
  hours: Array<number>;
  lastPlayedAt: string;
  minutesPerPlay: number;
  /** Longest run of calendar months with at least one play, as `YYYY-MM` bounds. */
  monthStreak: { end: string; months: number; start: string };
  onRepeat: Array<{ plays: number; track: StatsTrack; week: string }>;
  plays: number;
  sessionPlays: number;
  sessions: number;
  shelf: { albums: number; plays: number; topTenOnShelf: number };
  spanDays: number;
  topAlbums: Array<{ album: StatsAlbum; plays: number }>;
  tracks: number;
  /** Plays per local weekday, Monday first. */
  weekdays: Array<number>;
  years: Array<{ plays: number; year: number }>;
};

const int = v.number();

async function select<Schema extends v.GenericSchema>(
  sql: string,
  row: Schema,
): Promise<Array<v.InferOutput<Schema>>> {
  const rows = await dbClient.query(sql, { type: QueryTypes.SELECT });
  return v.parse(v.array(row), rows);
}

function selectSummary() {
  return select(
    `SELECT count(*)::int AS plays,
       count(DISTINCT "trackId")::int AS tracks,
       min("playedAt") AS "firstPlayedAt",
       max("playedAt") AS "lastPlayedAt",
       count(DISTINCT ${LOCAL_PLAYED_AT}::date)::int AS "activeDays",
       (max(${LOCAL_PLAYED_AT})::date - min(${LOCAL_PLAYED_AT})::date + 1)::int AS "spanDays"
     FROM "SpotifyPlay"`,
    v.object({
      activeDays: int,
      firstPlayedAt: v.nullable(v.date()),
      lastPlayedAt: v.nullable(v.date()),
      plays: int,
      spanDays: v.nullable(int),
      tracks: int,
    }),
  );
}

function selectArtistCount() {
  return select(
    `SELECT count(DISTINCT artist)::int AS artists
     FROM "SpotifyPlay", unnest("artistIds") AS artist`,
    v.object({ artists: int }),
  );
}

function selectKnownDurations() {
  return select(
    `SELECT count(*)::int AS "knownPlays", coalesce(sum(t."durationMs"), 0)::float8 AS "knownMs"
     FROM "SpotifyPlay" p
     JOIN "MusicTrack" t ON t.id = p."trackId"
     WHERE t."durationMs" IS NOT NULL`,
    v.object({ knownMs: int, knownPlays: int }),
  );
}

function selectBuckets(expression: string) {
  return select(
    `SELECT ${expression}::int AS bucket, count(*)::int AS plays
     FROM "SpotifyPlay" GROUP BY 1 ORDER BY 1`,
    v.object({ bucket: int, plays: int }),
  );
}

function selectActiveMonths() {
  return select(
    `SELECT DISTINCT to_char(${LOCAL_PLAYED_AT}, 'YYYY-MM') AS month
     FROM "SpotifyPlay" ORDER BY 1`,
    v.object({ month: v.string() }),
  );
}

function selectTopAlbumIds() {
  return select(
    `SELECT "albumId", count(*)::int AS plays
     FROM "SpotifyPlay" GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ${TOP_ALBUM_CANDIDATES}`,
    v.object({ albumId: v.string(), plays: int }),
  );
}

function selectShelf() {
  return select(
    `SELECT
       (SELECT count(*)::int FROM "FavoriteAlbum") AS albums,
       (SELECT count(*)::int FROM "SpotifyPlay"
         WHERE "albumId" IN (SELECT id FROM "FavoriteAlbum")) AS plays`,
    v.object({ albums: int, plays: int }),
  );
}

/**
 * Splits the full play history into runs of consecutive plays from one album,
 * then keeps the albums most often heard in runs long enough to be a session.
 */
function selectAlbumSessions() {
  return select(
    `WITH ordered AS (
       SELECT "albumId", "playedAt", "trackId",
         CASE WHEN "albumId" = lag("albumId") OVER (ORDER BY "playedAt", "trackId")
           THEN 0 ELSE 1 END AS "isStart"
       FROM "SpotifyPlay"
     ), runs AS (
       SELECT "albumId", sum("isStart") OVER (ORDER BY "playedAt", "trackId") AS run FROM ordered
     ), sized AS (
       SELECT "albumId", count(*)::int AS length FROM runs GROUP BY "albumId", run
     ), albums AS (
       SELECT "albumId",
         count(*) FILTER (WHERE length >= ${ALBUM_SESSION_MIN_PLAYS})::int AS sessions,
         coalesce(sum(length) FILTER (WHERE length >= ${ALBUM_SESSION_MIN_PLAYS}), 0)::int
           AS "sessionPlays",
         sum(length)::int AS plays
       FROM sized GROUP BY "albumId"
     )
     SELECT *,
       (sum(sessions) OVER ())::int AS "totalSessions",
       (sum("sessionPlays") OVER ())::int AS "totalSessionPlays"
     FROM albums WHERE sessions > 0
     ORDER BY sessions DESC, "sessionPlays" DESC, "albumId"
     LIMIT ${FRONT_TO_BACK_ALBUMS}`,
    v.object({
      albumId: v.string(),
      plays: int,
      sessionPlays: int,
      sessions: int,
      totalSessionPlays: int,
      totalSessions: int,
    }),
  );
}

/** Each track's single busiest `week` or `day`, keeping the busiest tracks overall. */
function selectRepeats(unit: 'day' | 'week', limit: number) {
  return select(
    `SELECT "trackId", period, plays FROM (
       SELECT DISTINCT ON ("trackId") "trackId", period, plays FROM (
         SELECT "trackId", to_char(date_trunc('${unit}', ${LOCAL_PLAYED_AT}), 'YYYY-MM-DD') AS period,
           count(*)::int AS plays
         FROM "SpotifyPlay" GROUP BY 1, 2
       ) counted
       ORDER BY "trackId", plays DESC, period
     ) best
     ORDER BY plays DESC, period, "trackId"
     LIMIT ${limit}`,
    v.object({ period: v.string(), plays: int, trackId: v.string() }),
  );
}

function selectArtistDepth() {
  return select(
    `SELECT artist AS "artistId", count(*)::int AS plays,
       count(DISTINCT "trackId")::int AS tracks,
       count(DISTINCT to_char(${LOCAL_PLAYED_AT}, 'YYYY-MM'))::int AS months
     FROM "SpotifyPlay", unnest("artistIds") AS artist
     GROUP BY artist ORDER BY plays DESC, artist LIMIT ${DEPTH_ARTISTS}`,
    v.object({ artistId: v.string(), months: int, plays: int, tracks: int }),
  );
}

function monthIndex(month: string): number {
  const [year = 0, monthOfYear = 1] = month.split('-').map(Number);
  return year * 12 + monthOfYear - 1;
}

/** Longest run of consecutive calendar months in a sorted `YYYY-MM` list. */
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

function fillBuckets(rows: Array<{ bucket: number; plays: number }>, size: number, first: number) {
  const buckets = Array.from({ length: size }, () => 0);
  for (const row of rows) {
    buckets[row.bucket - first] = row.plays;
  }
  return buckets;
}

const artistSchema = v.looseObject({
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  name: v.string(),
});

async function resolveArtistNames(artistIds: Array<string>): Promise<Map<string, string>> {
  const cached = await MusicArtist.findAll({ where: { id: { [Op.in]: artistIds } } });
  const names = new Map(cached.map((artist) => [artist.id, artist.name]));
  const fetched: Array<{ id: string; name: string; url: string }> = [];
  for (const id of artistIds.filter((artistId) => !names.has(artistId))) {
    try {
      const result = await spotifyGet(`artists/${id}`, artistSchema, 'stats artist');
      if (result.success) {
        fetched.push({ id, name: result.data.name, url: result.data.external_urls.spotify });
      }
    } catch (error) {
      log.warn('Failed to fetch artist for listening stats', { error, id });
    }
  }
  await MusicArtist.bulkCreate(fetched, { ignoreDuplicates: true });
  for (const artist of fetched) {
    names.set(artist.id, artist.name);
  }
  return names;
}

type CachedAlbumArtist = MusicArtist & { MusicAlbumArtist: { position: number } };

/**
 * Album display data from the Music* cache, then the favorite-albums shelf,
 * then Spotify (which also writes the album's tracks and durations through).
 */
async function resolveAlbums(albumIds: Array<string>): Promise<Map<string, StatsAlbum>> {
  const albums = new Map<string, StatsAlbum>();
  const cached = await MusicAlbum.findAll({
    include: [{ model: MusicArtist, through: { attributes: ['position'] } }],
    where: { id: { [Op.in]: albumIds } },
  });
  for (const album of cached) {
    // The include above selects the junction's `position`.
    const artists = [...(album.artists as Array<CachedAlbumArtist>)].sort(
      (a, b) => a.MusicAlbumArtist.position - b.MusicAlbumArtist.position,
    );
    if (album.name && album.imageUrl && artists.length > 0) {
      albums.set(album.id, {
        artistNames: artists.map((artist) => artist.name).join(', '),
        id: album.id,
        imageUrl: album.imageUrl,
        name: album.name,
        url: album.url ?? '',
      });
    }
  }

  const shelved = await db.FavoriteAlbum.findAll({
    where: { id: { [Op.in]: albumIds.filter((id) => !albums.has(id)) } },
  });
  for (const album of shelved) {
    albums.set(album.id, {
      artistNames: album.artistNames,
      id: album.id,
      imageUrl: album.imageUrl,
      name: album.name,
      url: album.url,
    });
  }

  for (const id of albumIds.filter((albumId) => !albums.has(albumId))) {
    try {
      const detail = await fetchAlbumDetail(id);
      if (detail) {
        albums.set(id, {
          artistNames: detail.artists.map((artist) => artist.name).join(', '),
          id,
          imageUrl: detail.imageUrl,
          name: detail.name,
          url: detail.url,
        });
      }
    } catch (error) {
      log.warn('Failed to fetch album for listening stats', { error, id });
    }
  }
  return albums;
}

/**
 * Aggregate listening stats over the whole SpotifyPlay history. Names and art
 * for the few albums, tracks, and artists on show resolve through the Music*
 * cache; anything Spotify can't name is left out. Null when nothing was played.
 */
export async function fetchListeningStats(): Promise<ListeningStats | null> {
  const [
    [summary],
    [artistCount],
    [durations],
    years,
    hours,
    weekdays,
    months,
    topAlbumIds,
    [shelf],
    sessions,
    onRepeat,
    dayRepeats,
    depth,
  ] = await Promise.all([
    selectSummary(),
    selectArtistCount(),
    selectKnownDurations(),
    selectBuckets(`extract(year FROM ${LOCAL_PLAYED_AT})`),
    selectBuckets(`extract(hour FROM ${LOCAL_PLAYED_AT})`),
    selectBuckets(`extract(isodow FROM ${LOCAL_PLAYED_AT})`),
    selectActiveMonths(),
    selectTopAlbumIds(),
    selectShelf(),
    selectAlbumSessions(),
    selectRepeats('week', ON_REPEAT_TRACKS),
    selectRepeats('day', DAY_REPEAT_TRACKS),
    selectArtistDepth(),
  ]);

  if (!summary?.firstPlayedAt || !summary.lastPlayedAt || summary.plays === 0) {
    return null;
  }

  const shelfIds = new Set(
    (await db.FavoriteAlbum.findAll({ attributes: ['id'] })).map((album) => album.id),
  );
  const shownAlbums = topAlbumIds.slice(0, TOP_ALBUMS);
  const [albums, tracks, artistNames] = await Promise.all([
    resolveAlbums([...new Set([...shownAlbums, ...sessions].map((row) => row.albumId))]),
    resolveTrackDisplays([...onRepeat, ...dayRepeats].map((row) => row.trackId)),
    resolveArtistNames(depth.map((row) => row.artistId)),
  ]);

  const statsTrack = (trackId: string): StatsTrack | null => {
    const track = tracks.get(trackId);
    return track
      ? { artistNames: track.artistNames, id: track.id, name: track.name, url: track.url }
      : null;
  };

  const minutesPerPlay =
    durations && durations.knownPlays > 0
      ? durations.knownMs / durations.knownPlays / 60_000
      : FALLBACK_MINUTES_PER_PLAY;

  return {
    activeDays: summary.activeDays,
    activeMonths: months.length,
    artists: artistCount?.artists ?? 0,
    dayRepeats: dayRepeats
      .map(({ period, plays, trackId }) => {
        const track = statsTrack(trackId);
        return track ? { day: period, plays, track } : null;
      })
      .filter(isNotNullish),
    depth: depth
      .map(({ artistId, months: artistMonths, plays, tracks: artistTracks }) => {
        const name = artistNames.get(artistId);
        return name ? { months: artistMonths, name, plays, tracks: artistTracks } : null;
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
    monthStreak: longestMonthStreak(months.map((row) => row.month)),
    onRepeat: onRepeat
      .map(({ period, plays, trackId }) => {
        const track = statsTrack(trackId);
        return track ? { plays, track, week: period } : null;
      })
      .filter(isNotNullish),
    plays: summary.plays,
    sessionPlays: sessions[0]?.totalSessionPlays ?? 0,
    sessions: sessions[0]?.totalSessions ?? 0,
    shelf: {
      albums: shelf?.albums ?? 0,
      plays: shelf?.plays ?? 0,
      topTenOnShelf: topAlbumIds.filter((row) => shelfIds.has(row.albumId)).length,
    },
    spanDays: summary.spanDays ?? 1,
    topAlbums: shownAlbums
      .map(({ albumId, plays }) => {
        const album = albums.get(albumId);
        return album ? { album, plays } : null;
      })
      .filter(isNotNullish),
    tracks: summary.tracks,
    weekdays: fillBuckets(weekdays, 7, 1),
    years: years.map((row) => ({ plays: row.plays, year: row.bucket })),
  };
}
