import 'server-only';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { parseStoredStravaActivity } from './parseStoredStravaActivity';
import { summarizeStravaHistory } from './summarizeStravaHistory';

/**
 * Summarizes every stored activity. Rows that no longer parse are skipped
 * rather than failing the whole history.
 */
export const fetchStravaHistoryFromDb = async (now = new Date()): Promise<StravaHistory | null> => {
  if (process.env.NODE_ENV !== 'test' && !process.env.DATABASE_URL) {
    return null;
  }
  const { db } = await import('@dg/db');
  const rows = await db.StravaActivity.findAll({
    attributes: ['activityData', 'activityStartDate'],
    order: [['activityStartDate', 'DESC']],
  });
  const activities = rows.flatMap((row) => {
    const activity = parseStoredStravaActivity(row.activityData, row.activityStartDate);
    return activity ? [activity] : [];
  });
  return summarizeStravaHistory(activities, now);
};
