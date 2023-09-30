import { isRecord } from 'shared-core/src/typeguards';
import type { StravaDetailedActivity } from 'db/src/models/StravaDetailedActivity';
import { db } from 'db/src/client';
import { paredStravaActivity } from './paredStravaActivity';

/**
 * Used to convert a JsonValue into an activity.
 */
const isStravaActivity = (activity: unknown): activity is StravaDetailedActivity =>
  isRecord(activity) && typeof activity.id === 'number' && typeof activity.type === 'string';

/**
 * Fetch latest version of the activity from Strava's API
 */
export const fetchLatestStravaActivityFromDb = async () => {
  const data = await db.StravaActivity.findOne({
    order: [['activityStartDate', 'DESC']],
    attributes: ['activityData'],
  });
  const activity = data?.activityData;
  if (isStravaActivity(activity)) {
    return paredStravaActivity(activity);
  }
  return null;
};