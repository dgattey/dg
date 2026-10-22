import 'server-only';

import { parseStoredStravaActivity } from './parseStoredStravaActivity';

/**
 * Fetch latest version of the activity from Strava's API
 */
export const fetchLatestStravaActivityFromDb = async () => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  const { db } = await import('@dg/db');
  const data = await db.StravaActivity.findOne({
    attributes: ['activityData', 'activityStartDate'],
    order: [['activityStartDate', 'DESC']],
  });
  if (!data) {
    return null;
  }
  return parseStoredStravaActivity(data.activityData, data.activityStartDate);
};
