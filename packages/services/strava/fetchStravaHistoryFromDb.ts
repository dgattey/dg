import 'server-only';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { log } from '@dg/shared-core/logging/log';
import { parseStoredStravaActivity } from './parseStoredStravaActivity';
import { summarizeStravaHistory } from './summarizeStravaHistory';

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

/**
 * Summarizes every stored activity. Rows that no longer parse are skipped
 * rather than failing the whole history. Returns null if the database is unreachable.
 */
export const fetchStravaHistoryFromDb = async (now = new Date()): Promise<StravaHistory | null> => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const { db, dbClient } = await import('@dg/db');
    const rows = await db.StravaActivity.findAll({
      attributes: [[dbClient.literal(PROJECTED_STRAVA_HISTORY_DATA_SQL), 'activityData']],
      order: [['activityStartDate', 'DESC']],
    });
    const activities = rows.flatMap((row) => {
      const activity = parseStoredStravaActivity(row.activityData);
      return activity ? [activity] : [];
    });
    return summarizeStravaHistory(activities, now);
  } catch (error) {
    log.warn('Could not read Strava history from database', { error });
    return null;
  }
};
