import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { parseStoredStravaActivity } from './parseStoredStravaActivity';

const PROJECTED_LATEST_ACTIVITY_DATA_SQL = `CASE
  WHEN COALESCE(NULLIF("activityData"->'map'->>'summaryPolyline', ''), '') <> ''
  THEN (("activityData"::jsonb) #- '{map,polyline}')::json
  ELSE "activityData"
END`;

export const fetchLatestStravaActivityFromDb = async () => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const { db, dbClient } = await import('@dg/db');
    const data = await db.StravaActivity.findOne({
      attributes: [[dbClient.literal(PROJECTED_LATEST_ACTIVITY_DATA_SQL), 'activityData']],
      order: [['activityStartDate', 'DESC']],
    });
    if (!data) {
      return null;
    }
    return parseStoredStravaActivity(data.activityData);
  } catch (error) {
    log.warn('Could not read latest Strava activity from database', { error });
    return null;
  }
};
