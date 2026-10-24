import 'server-only';

import type { StravaHistory, StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import type {
  PackedStravaOutingTuple,
  StravaHistorySummaryPayload,
} from '@dg/db/models/StravaHistorySummary';
import { log } from '@dg/shared-core/logging/log';
import { hydrateCityCoverage, rollingWindowsMatch } from './measureStreetCoverage';
import { parseStoredStravaActivity } from './parseStoredStravaActivity';
import { summarizeStravaHistory, yearTotalsForOutings } from './summarizeStravaHistory';

export const STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION = 1;

/**
 * Projects only the fields `summarizeStravaHistory` reads using native `json` field
 * extraction, stripping the full-resolution `map.polyline`, photo URLs, and older
 * descriptions before Postgres serializes the result set over the network.
 */
export const PROJECTED_STRAVA_HISTORY_DATA_SQL = `json_strip_nulls(
  json_build_object(
    'id', "activityData"->'id',
    'name', "activityData"->'name',
    'type', "activityData"->'type',
    'sportType', "activityData"->'sportType',
    'startDate', "activityData"->'startDate',
    'distance', "activityData"->'distance',
    'movingTime', "activityData"->'movingTime',
    'totalElevationGain', "activityData"->'totalElevationGain',
    'gearId', "activityData"->'gearId',
    'gear', CASE
      WHEN json_typeof("activityData"->'gear') = 'object' THEN
        json_strip_nulls(
          json_build_object(
            'id', "activityData"->'gear'->'id',
            'name', "activityData"->'gear'->'name',
            'distance', "activityData"->'gear'->'distance'
          )
        )
      ELSE NULL
    END,
    'url', "activityData"->'url',
    'private', "activityData"->'private',
    'visibility', "activityData"->'visibility',
    'description', CASE
      WHEN row_number() OVER (ORDER BY "activityStartDate" DESC) <= 5
      THEN "activityData"->'description'
      ELSE NULL
    END,
    'map', CASE
      WHEN COALESCE(
        NULLIF("activityData"->'map'->>'summaryPolyline', ''),
        NULLIF("activityData"->'map'->>'polyline', '')
      ) IS NOT NULL THEN
        json_build_object(
          'summaryPolyline',
          COALESCE(
            NULLIF("activityData"->'map'->>'summaryPolyline', ''),
            NULLIF("activityData"->'map'->>'polyline', '')
          )
        )
      ELSE NULL
    END
  )
)`;

const READ_CACHED_SUMMARY_SQL = `WITH live_stats AS (
  SELECT
    count(*)::int AS "activityCount",
    max("id") AS "latestActivityId",
    max("updatedAt") AS "latestActivityUpdatedAt"
  FROM "StravaActivity"
)
SELECT
  (
    summary."singleton" IS NOT NULL
    AND summary."schemaVersion" = :schemaVersion
    AND summary."activityCount" = live_stats."activityCount"
    AND summary."latestActivityId" IS NOT DISTINCT FROM live_stats."latestActivityId"
    AND summary."latestActivityUpdatedAt" IS NOT DISTINCT FROM live_stats."latestActivityUpdatedAt"
  ) AS "cacheHit",
  summary."computedAt" AS "computedAt",
  CASE
    WHEN summary."singleton" IS NOT NULL
      AND summary."schemaVersion" = :schemaVersion
      AND summary."activityCount" = live_stats."activityCount"
      AND summary."latestActivityId" IS NOT DISTINCT FROM live_stats."latestActivityId"
      AND summary."latestActivityUpdatedAt" IS NOT DISTINCT FROM live_stats."latestActivityUpdatedAt"
    THEN summary."payload"
    ELSE NULL
  END AS "payload"
FROM live_stats
LEFT JOIN "StravaHistorySummary" AS summary
  ON summary."singleton" = TRUE`;

const UPSERT_CACHED_SUMMARY_SQL = `INSERT INTO "StravaHistorySummary" (
  "singleton",
  "schemaVersion",
  "activityCount",
  "latestActivityId",
  "latestActivityUpdatedAt",
  "computedAt",
  "payload"
)
SELECT
  TRUE,
  :schemaVersion,
  count(*)::int,
  max("id"),
  max("updatedAt"),
  :computedAt,
  :payload::jsonb
FROM "StravaActivity"
ON CONFLICT ("singleton") DO UPDATE SET
  "schemaVersion" = EXCLUDED."schemaVersion",
  "activityCount" = EXCLUDED."activityCount",
  "latestActivityId" = EXCLUDED."latestActivityId",
  "latestActivityUpdatedAt" = EXCLUDED."latestActivityUpdatedAt",
  "computedAt" = EXCLUDED."computedAt",
  "payload" = EXCLUDED."payload"`;

type CachedSummaryLookupRow = {
  cacheHit: boolean;
  computedAt: Date | string | null;
  payload: StravaHistorySummaryPayload | null;
};

export function packStravaHistory(history: StravaHistory): StravaHistorySummaryPayload {
  const polylines: Array<string> = [];
  const indexByPolyline = new Map<string, number>();
  const getPolylineIndex = (polyline: string | null): number | null => {
    if (!polyline) {
      return null;
    }
    const existing = indexByPolyline.get(polyline);
    if (existing !== undefined) {
      return existing;
    }
    const index = polylines.length;
    polylines.push(polyline);
    indexByPolyline.set(polyline, index);
    return index;
  };

  return {
    bikes: history.bikes,
    latest: history.latest,
    outings: history.outings.map((outing): PackedStravaOutingTuple => {
      const polylineIndex = getPolylineIndex(outing.polyline);
      const startEpochMs = Date.parse(outing.startDate);
      const defaultUrl = `https://www.strava.com/activities/${outing.id}`;
      return outing.url === defaultUrl
        ? [
            outing.id,
            outing.name,
            outing.sport,
            startEpochMs,
            outing.distanceMeters,
            outing.elevationGainMeters,
            outing.movingTimeSeconds,
            polylineIndex,
          ]
        : [
            outing.id,
            outing.name,
            outing.sport,
            startEpochMs,
            outing.distanceMeters,
            outing.elevationGainMeters,
            outing.movingTimeSeconds,
            polylineIndex,
            outing.url,
          ];
    }),
    polylines,
    streetCoverageRidden: {
      sd: history.streetCoverage.sd.ridden,
      sf: history.streetCoverage.sf.ridden,
    },
    totals: history.totals,
  };
}

export function unpackStravaHistory(
  payload: StravaHistorySummaryPayload,
  now: Date,
): StravaHistory {
  const outings: Array<StravaLogEntry> = payload.outings.map((tuple) => {
    const [
      id,
      name,
      sport,
      startEpochMs,
      distanceMeters,
      elevationGainMeters,
      movingTimeSeconds,
      polylineIndex,
      customUrl,
    ] = tuple;
    return {
      distanceMeters,
      elevationGainMeters,
      id,
      movingTimeSeconds,
      name,
      polyline: polylineIndex === null ? null : (payload.polylines[polylineIndex] ?? null),
      sport,
      startDate: new Date(startEpochMs).toISOString(),
      url: customUrl ?? `https://www.strava.com/activities/${id}`,
    };
  });

  return {
    bikes: payload.bikes,
    latest: payload.latest,
    outings,
    streetCoverage: hydrateCityCoverage(payload.streetCoverageRidden),
    thisYear: yearTotalsForOutings(now.getUTCFullYear(), outings),
    totals: payload.totals,
  };
}

/**
 * Rebuilds the Strava history summary from `"StravaActivity"` and persists it
 * into `"StravaHistorySummary"`.
 */
export const refreshStravaHistorySummary = async (
  now = new Date(),
): Promise<StravaHistory | null> => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  const { db, dbClient } = await import('@dg/db');
  const rows = await db.StravaActivity.findAll({
    attributes: [[dbClient.literal(PROJECTED_STRAVA_HISTORY_DATA_SQL), 'activityData']],
    order: [['activityStartDate', 'DESC']],
  });
  const activities = rows.flatMap((row) => {
    const activity = parseStoredStravaActivity(row.activityData);
    return activity ? [activity] : [];
  });
  const history = summarizeStravaHistory(activities, now);
  const packedPayload = history ? JSON.stringify(packStravaHistory(history)) : null;
  await dbClient.query(UPSERT_CACHED_SUMMARY_SQL, {
    replacements: {
      computedAt: now,
      payload: packedPayload,
      schemaVersion: STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION,
    },
  });
  return history;
};

/**
 * Reads the precomputed Strava history summary from `"StravaHistorySummary"` in
 * one row, rebuilding and persisting it from `"StravaActivity"` when the cache
 * is empty, out of date, or on an older schema version. Returns null if the
 * database is unreachable.
 */
export const fetchStravaHistoryFromDb = async (now = new Date()): Promise<StravaHistory | null> => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const { dbClient, QueryTypes } = await import('@dg/db');
    const [cachedRow] = await dbClient.query<CachedSummaryLookupRow>(READ_CACHED_SUMMARY_SQL, {
      replacements: { schemaVersion: STRAVA_HISTORY_SUMMARY_SCHEMA_VERSION },
      type: QueryTypes.SELECT,
    });
    if (cachedRow?.cacheHit) {
      if (!cachedRow.payload) {
        return null;
      }
      const unpacked = unpackStravaHistory(cachedRow.payload, now);
      const computedAt = cachedRow.computedAt ? new Date(cachedRow.computedAt) : now;
      if (rollingWindowsMatch(unpacked.outings, computedAt, now)) {
        return unpacked;
      }
    }
    return await refreshStravaHistorySummary(now);
  } catch (error) {
    log.warn('Could not read Strava history from database', { error });
    return null;
  }
};
