import { db } from 'db';
import type { StravaDetailedActivity } from 'db/models/StravaDetailedActivity';
import { isRecord } from 'shared-core/helpers/typeguards';
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
    attributes: ['activityData'],
    order: [['activityStartDate', 'DESC']],
  });
  const activity = data?.activityData;
  if (isStravaActivity(activity)) {
    return paredStravaActivity(activity);
  }
  return null;
};
