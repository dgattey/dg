import 'server-only';

import { dbClient, QueryTypes } from '@dg/db';
import * as v from 'valibot';

/** Days, hours, and weeks are bucketed where the listening happened. */
const TIME_ZONE = 'America/Los_Angeles';
const LOCAL_PLAYED_AT = `("playedAt" AT TIME ZONE '${TIME_ZONE}')`;

/** A run of this many consecutive plays from one album counts as hearing it front to back. */
export const ALBUM_SESSION_MIN_PLAYS = 5;

const TOP_ALBUM_CANDIDATES = 10;
const FRONT_TO_BACK_ALBUMS = 4;
const DEPTH_ARTISTS = 8;

const int = v.number();

async function select<Schema extends v.GenericSchema>(
  sql: string,
  row: Schema,
): Promise<Array<v.InferOutput<Schema>>> {
  const rows = await dbClient.query(sql, { type: QueryTypes.SELECT });
  return v.parse(v.array(row), rows);
}

export function selectSummary() {
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

export function selectArtistCount() {
  return select(
    `SELECT count(DISTINCT artist)::int AS artists
     FROM "SpotifyPlay", unnest("artistIds") AS artist`,
    v.object({ artists: int }),
  );
}

export function selectKnownDurations() {
  return select(
    `SELECT count(*)::int AS "knownPlays", coalesce(sum(t."durationMs"), 0)::float8 AS "knownMs"
     FROM "SpotifyPlay" p
     JOIN "MusicTrack" t ON t.id = p."trackId"
     WHERE t."durationMs" IS NOT NULL`,
    v.object({ knownMs: int, knownPlays: int }),
  );
}

/** Plays per local `year`, `hour`, or ISO weekday. */
export function selectLocalBuckets(part: 'hour' | 'isodow' | 'year') {
  return select(
    `SELECT extract(${part} FROM ${LOCAL_PLAYED_AT})::int AS bucket, count(*)::int AS plays
     FROM "SpotifyPlay" GROUP BY 1 ORDER BY 1`,
    v.object({ bucket: int, plays: int }),
  );
}

export function selectActiveMonths() {
  return select(
    `SELECT DISTINCT to_char(${LOCAL_PLAYED_AT}, 'YYYY-MM') AS month
     FROM "SpotifyPlay" ORDER BY 1`,
    v.object({ month: v.string() }),
  );
}

export function selectTopAlbumIds() {
  return select(
    `SELECT "albumId", count(*)::int AS plays
     FROM "SpotifyPlay" GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ${TOP_ALBUM_CANDIDATES}`,
    v.object({ albumId: v.string(), plays: int }),
  );
}

export function selectShelf() {
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
export function selectAlbumSessions() {
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
export function selectRepeats(unit: 'day' | 'week', limit: number) {
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

export function selectArtistDepth() {
  return select(
    `SELECT artist AS "artistId", count(*)::int AS plays,
       count(DISTINCT "trackId")::int AS tracks,
       count(DISTINCT to_char(${LOCAL_PLAYED_AT}, 'YYYY-MM'))::int AS months
     FROM "SpotifyPlay", unnest("artistIds") AS artist
     GROUP BY artist ORDER BY plays DESC, artist LIMIT ${DEPTH_ARTISTS}`,
    v.object({ artistId: v.string(), months: int, plays: int, tracks: int }),
  );
}
