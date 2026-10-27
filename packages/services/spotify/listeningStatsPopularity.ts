import 'server-only';

import type { MusicTrackPopularitySource } from '@dg/db/models/MusicTrackPopularity';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import * as v from 'valibot';
import { select } from './listeningStatsQueries';

/**
 * A snapshot taken within this many days after a play counts as the track's
 * popularity when it was played: syncs run every 15 minutes, so this only
 * absorbs midnight rollovers and short sync outages.
 */
const AT_PLAY_WINDOW_DAYS = 3;

export type StatsPopularityYear = {
  /** Share of scored plays whose snapshot was taken when they were played. */
  atPlayShare: number;
  /** Play-weighted average popularity, 0–100, or null when no play is scored. */
  popularity: number | null;
  /** Share of the year's plays with a score from `source`. */
  scoredShare: number;
  year: number;
};

/** One source's popularity per Pacific year, never blending Spotify and Deezer. */
export type StatsPopularity = {
  /** Pacific `YYYY-MM-DD` of the first snapshot from `source`. */
  firstCapturedOn: string;
  source: MusicTrackPopularitySource;
  years: Array<StatsPopularityYear>;
};

const sourceRow = v.object({
  firstCapturedOn: v.string(),
  source: v.picklist(['spotify', 'deezer']),
});

const yearRow = v.object({
  plays: v.number(),
  popularity: v.nullable(v.number()),
  scored: v.number(),
  scoredAtPlay: v.number(),
  year: v.number(),
});

/**
 * Spotify when any Spotify snapshot exists, so Deezer ranks (stored only for
 * tracks Spotify can't score) back the line only if Spotify stops scoring.
 */
async function selectPopularitySource() {
  const sources = await select(
    `SELECT source, to_char(min("capturedOn"), 'YYYY-MM-DD') AS "firstCapturedOn"
     FROM "MusicTrackPopularity" GROUP BY source`,
    sourceRow,
  );
  return sources.find((row) => row.source === 'spotify') ?? sources[0] ?? null;
}

/**
 * Average popularity of the songs played each Pacific year, weighted by plays.
 * Each play reads its track's snapshot taken nearest on or after the play's
 * day, else the latest one before it, so plays from before snapshots began
 * read the track's earliest (current) score.
 */
export async function selectYearlyPopularity(): Promise<StatsPopularity | null> {
  const source = await selectPopularitySource();
  if (!source) {
    return null;
  }
  const rows = await select(
    `WITH plays AS (
       SELECT "trackId", ("playedAt" AT TIME ZONE '${SITE_TIME_ZONE}')::date AS day
       FROM "SpotifyPlay"
     )
     SELECT extract(year FROM p.day)::int AS year,
       count(*)::int AS plays,
       count(s.popularity)::int AS scored,
       count(*) FILTER (WHERE s."capturedOn" - p.day BETWEEN 0 AND :window)::int AS "scoredAtPlay",
       avg(s.popularity)::float8 AS popularity
     FROM plays p
     LEFT JOIN LATERAL (
       SELECT m.popularity, m."capturedOn"
       FROM "MusicTrackPopularity" m
       WHERE m."trackId" = p."trackId" AND m.source = :source
       ORDER BY m."capturedOn" < p.day, abs(m."capturedOn" - p.day)
       LIMIT 1
     ) s ON true
     GROUP BY 1 ORDER BY 1`,
    yearRow,
    { source: source.source, window: AT_PLAY_WINDOW_DAYS },
  );
  return {
    firstCapturedOn: source.firstCapturedOn,
    source: source.source,
    years: rows.map((row) => ({
      atPlayShare: row.scored > 0 ? row.scoredAtPlay / row.scored : 0,
      popularity: row.popularity === null ? null : Math.round(row.popularity * 10) / 10,
      scoredShare: row.plays > 0 ? row.scored / row.plays : 0,
      year: row.year,
    })),
  };
}
