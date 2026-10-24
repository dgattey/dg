import 'server-only';

import { dbClient, QueryTypes } from '@dg/db';
import * as v from 'valibot';

/** Days, hours, and weeks are bucketed where the listening happened. */
export const TIME_ZONE = 'America/Los_Angeles';
const LOCAL_PLAYED_AT = `("playedAt" AT TIME ZONE '${TIME_ZONE}')`;

/** A run of this many consecutive plays from one album counts as hearing it front to back. */
export const ALBUM_SESSION_MIN_PLAYS = 5;

const TOP_ALBUM_CANDIDATES = 10;
const TOP_TRACK_CANDIDATES = 8;
const FRONT_TO_BACK_ALBUMS = 4;
const DEPTH_ARTISTS = 25;
const TOP_GENRES_LIMIT = 8;

const int = v.number();
const artistRef = v.object({ id: v.string(), name: v.string(), url: v.nullable(v.string()) });

export type SqlPlayFilter = {
  /** SQL predicate over `{alias}."playedAt"` using only index-friendly timestamp bounds. */
  predicate: (alias?: string) => string;
};

export const ALL_TIME_FILTER: SqlPlayFilter = { predicate: () => '' };
const columnRef = (alias?: string): string => (alias ? `${alias}."playedAt"` : '"playedAt"');
export const whereClause = (filter: SqlPlayFilter, alias?: string): string => {
  const cond = filter.predicate(alias);
  return cond ? `WHERE ${cond}` : '';
};
const andClause = (filter: SqlPlayFilter, alias?: string): string => {
  const cond = filter.predicate(alias);
  return cond ? `AND ${cond}` : '';
};

export function yearPlayFilter(year: number): SqlPlayFilter {
  const safeYear = Math.trunc(year);
  const startExpr = `('${safeYear}-01-01 00:00:00'::timestamp AT TIME ZONE '${TIME_ZONE}')`;
  const endExpr = `('${safeYear + 1}-01-01 00:00:00'::timestamp AT TIME ZONE '${TIME_ZONE}')`;
  return {
    predicate: (alias) => {
      const col = columnRef(alias);
      return `${col} >= ${startExpr} AND ${col} < ${endExpr}`;
    },
  };
}

export function rollingDaysPlayFilter(anchor: Date, days: number): SqlPlayFilter {
  const safeDays = Math.max(1, Math.trunc(days));
  const iso = anchor.toISOString();
  const startExpr = `((('${iso}'::timestamptz AT TIME ZONE '${TIME_ZONE}')::date - ${safeDays - 1})::timestamp AT TIME ZONE '${TIME_ZONE}')`;
  const endExpr = `'${iso}'::timestamptz`;
  return {
    predicate: (alias) => {
      const col = columnRef(alias);
      return `${col} >= ${startExpr} AND ${col} <= ${endExpr}`;
    },
  };
}

export async function select<Schema extends v.GenericSchema>(
  sql: string,
  row: Schema,
  replacements?: Record<string, unknown>,
): Promise<Array<v.InferOutput<Schema>>> {
  const rows = await dbClient.query(sql, { replacements, type: QueryTypes.SELECT });
  return v.parse(v.array(row), rows);
}

export async function selectLatestPlayedAt(): Promise<Date | null> {
  const [row] = await select(
    'SELECT max("playedAt") AS "lastPlayedAt" FROM "SpotifyPlay"',
    v.object({ lastPlayedAt: v.nullable(v.date()) }),
  );
  return row?.lastPlayedAt ?? null;
}

export function selectSummary(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  const where = whereClause(filter);
  return select(
    `SELECT
       (SELECT count(*)::int FROM "SpotifyPlay" ${where}) AS plays,
       (SELECT count(*)::int FROM (SELECT DISTINCT "trackId" FROM "SpotifyPlay" ${where}) t) AS tracks,
       bounds."firstPlayedAt",
       bounds."lastPlayedAt",
       (SELECT count(*)::int FROM (SELECT DISTINCT ${LOCAL_PLAYED_AT}::date FROM "SpotifyPlay" ${where}) d) AS "activeDays",
       ((bounds."lastPlayedAt" AT TIME ZONE '${TIME_ZONE}')::date - (bounds."firstPlayedAt" AT TIME ZONE '${TIME_ZONE}')::date + 1)::int AS "spanDays"
     FROM (
       SELECT min("playedAt") AS "firstPlayedAt", max("playedAt") AS "lastPlayedAt"
       FROM "SpotifyPlay" ${where}
     ) bounds`,
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

export function selectArtistCount(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT count(*)::int AS artists
     FROM (SELECT DISTINCT unnest("artistIds") AS artist FROM "SpotifyPlay" ${whereClause(filter)}) a`,
    v.object({ artists: int }),
  );
}

export function selectKnownDurations(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT count(*)::int AS "knownPlays", coalesce(sum(t."durationMs"), 0)::float8 AS "knownMs"
     FROM "SpotifyPlay" p
     JOIN "MusicTrack" t ON t.id = p."trackId"
     WHERE t."durationMs" IS NOT NULL ${andClause(filter, 'p')}`,
    v.object({ knownMs: int, knownPlays: int }),
  );
}

export function selectLocalBuckets(part: 'hour' | 'year', filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT extract(${part} FROM ${LOCAL_PLAYED_AT})::int AS bucket, count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1 ORDER BY 1`,
    v.object({ bucket: int, plays: int }),
  );
}

export function selectMonthlyPlays(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT
       extract(year FROM ${LOCAL_PLAYED_AT})::int AS year,
       extract(month FROM ${LOCAL_PLAYED_AT})::int AS month,
       count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)}
     GROUP BY 1, 2
     ORDER BY 1, 2`,
    v.object({ month: int, plays: int, year: int }),
  );
}

export function selectActiveMonths(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT to_char(m, 'YYYY-MM') AS month
     FROM (SELECT DISTINCT date_trunc('month', ${LOCAL_PLAYED_AT})::date AS m FROM "SpotifyPlay" ${whereClause(filter)}) months
     ORDER BY m`,
    v.object({ month: v.string() }),
  );
}

export function selectDailyPlays(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT to_char(${LOCAL_PLAYED_AT}::date, 'YYYY-MM-DD') AS day, count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1 ORDER BY 1`,
    v.object({ day: v.string(), plays: int }),
  );
}

export function selectDayHourPlays(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT to_char(${LOCAL_PLAYED_AT}::date, 'YYYY-MM-DD') AS day,
       extract(hour FROM ${LOCAL_PLAYED_AT})::int AS hour, count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1, 2 ORDER BY 1, 2`,
    v.object({ day: v.string(), hour: int, plays: int }),
  );
}

export function selectTopAlbumIds(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT "albumId", count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ${TOP_ALBUM_CANDIDATES}`,
    v.object({ albumId: v.string(), plays: int }),
  );
}

export function selectTopTrackIds(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT "trackId", count(*)::int AS plays
     FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ${TOP_TRACK_CANDIDATES}`,
    v.object({ plays: int, trackId: v.string() }),
  );
}

export function selectBucketTopTracks(
  unit: 'day' | 'month' | 'week' | 'year',
  filter: SqlPlayFilter = ALL_TIME_FILTER,
) {
  const bucketExpr =
    unit === 'year'
      ? `to_char(date_trunc('year', ${LOCAL_PLAYED_AT})::date, 'YYYY')`
      : unit === 'month'
        ? `to_char(date_trunc('month', ${LOCAL_PLAYED_AT})::date, 'YYYY-MM')`
        : unit === 'week'
          ? `to_char(date_trunc('week', ${LOCAL_PLAYED_AT})::date, 'YYYY-MM-DD')`
          : `to_char(${LOCAL_PLAYED_AT}::date, 'YYYY-MM-DD')`;
  return select(
    `WITH counted AS (
       SELECT ${bucketExpr} AS bucket, "trackId", count(*)::int AS plays
       FROM "SpotifyPlay" ${whereClause(filter)} GROUP BY 1, 2
     )
     SELECT DISTINCT ON (bucket) bucket, "trackId", plays
     FROM counted ORDER BY bucket DESC, plays DESC, "trackId"`,
    v.object({ bucket: v.string(), plays: int, trackId: v.string() }),
  );
}

export function selectShelf(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `SELECT
       (SELECT count(*)::int FROM "FavoriteAlbum") AS albums,
       (SELECT count(*)::int FROM "SpotifyPlay"
         WHERE "albumId" IN (SELECT id FROM "FavoriteAlbum") ${andClause(filter)}) AS plays`,
    v.object({ albums: int, plays: int }),
  );
}

export function selectAlbumSessions(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `WITH ordered AS (
       SELECT "albumId", "playedAt", "trackId",
         CASE WHEN "albumId" = lag("albumId") OVER (ORDER BY "playedAt", "trackId")
           THEN 0 ELSE 1 END AS "isStart"
       FROM "SpotifyPlay" ${whereClause(filter)}
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

export function selectRepeats(
  unit: 'day' | 'week',
  limit: number,
  filter: SqlPlayFilter = ALL_TIME_FILTER,
) {
  return select(
    `WITH counted AS MATERIALIZED (
       SELECT "trackId", date_trunc('${unit}', ${LOCAL_PLAYED_AT})::date AS period,
         count(*)::int AS plays
       FROM "SpotifyPlay" ${whereClause(filter)}
       GROUP BY 1, 2 HAVING count(*) > 1
     )
     SELECT "trackId", to_char(period, 'YYYY-MM-DD') AS period, plays FROM (
       SELECT DISTINCT ON ("trackId") "trackId", period, plays
       FROM counted ORDER BY "trackId", plays DESC, period
     ) best
     ORDER BY plays DESC, period, "trackId" LIMIT ${limit}`,
    v.object({ period: v.string(), plays: int, trackId: v.string() }),
  );
}

export function selectArtistDepth(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `WITH top_artists AS (
       SELECT artist AS "artistId", count(*)::int AS plays
       FROM "SpotifyPlay", unnest("artistIds") AS artist
       ${whereClause(filter)}
       GROUP BY artist ORDER BY plays DESC, artist LIMIT ${DEPTH_ARTISTS}
     )
     SELECT ta."artistId", ta.plays,
       count(DISTINCT p."trackId")::int AS tracks,
       count(DISTINCT date_trunc('month', (p."playedAt" AT TIME ZONE '${TIME_ZONE}'))::date)::int AS months
     FROM top_artists ta
     JOIN "SpotifyPlay" p ON p."artistIds" @> ARRAY[ta."artistId"]::varchar(64)[] ${andClause(filter, 'p')}
     GROUP BY ta."artistId", ta.plays
     ORDER BY ta.plays DESC, ta."artistId"`,
    v.object({ artistId: v.string(), months: int, plays: int, tracks: int }),
  );
}

export function selectTopGenres(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  return select(
    `WITH artist_plays AS (
       SELECT artist AS "artistId", count(*)::int AS plays, count(DISTINCT "trackId")::int AS tracks
       FROM "SpotifyPlay", unnest("artistIds") AS artist
       ${whereClause(filter)} GROUP BY artist
     ),
     artist_genres AS (
       SELECT ma.id, ma.name, ma.url, ap.plays, ap.tracks, ma.genres[1] AS genre
       FROM artist_plays ap
       JOIN "MusicArtist" ma ON ma.id = ap."artistId"
       WHERE coalesce(array_length(ma.genres, 1), 0) > 0
     ),
     ranked AS (
       SELECT genre, id, name, url, plays, tracks,
         row_number() OVER (PARTITION BY genre ORDER BY plays DESC, name) AS rn,
         sum(plays) OVER (PARTITION BY genre)::int AS total_plays,
         sum(tracks) OVER (PARTITION BY genre)::int AS total_tracks
       FROM artist_genres
     )
     SELECT genre, total_plays AS plays, total_tracks AS tracks,
       coalesce(
         json_agg(json_build_object('id', id, 'name', name, 'url', url) ORDER BY rn)
           FILTER (WHERE rn <= 3),
         '[]'::json
       ) AS artists
     FROM ranked
     GROUP BY genre, total_plays, total_tracks
     ORDER BY total_plays DESC, genre LIMIT ${TOP_GENRES_LIMIT}`,
    v.object({ artists: v.array(artistRef), genre: v.string(), plays: int, tracks: int }),
  );
}

/**
 * Each artist's first ever play, for those whose first play falls inside `filter`. Only
 * plays naming one of `artistIds` are read, through the `artistIds` GIN index.
 */
export async function selectArtistFirstPlays(
  artistIds: ReadonlyArray<string>,
  filter: SqlPlayFilter = ALL_TIME_FILTER,
): Promise<Array<{ artistId: string; playedAt: Date }>> {
  if (artistIds.length === 0) return [];
  return await select(
    `WITH firsts AS (
       SELECT artist AS "artistId", min("playedAt") AS "playedAt"
       FROM "SpotifyPlay", unnest("artistIds") AS artist
       WHERE "artistIds" && ARRAY[:artistIds]::varchar(64)[] AND artist IN (:artistIds)
       GROUP BY artist
     )
     SELECT "artistId", "playedAt" FROM firsts ${whereClause(filter)}`,
    v.object({ artistId: v.string(), playedAt: v.date() }),
    { artistIds: [...artistIds] },
  );
}
