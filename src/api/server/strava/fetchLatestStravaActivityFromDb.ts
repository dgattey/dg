import { isRecord } from '@dg/api/parsers';
import { Prisma } from '@dg/api/server/generated';
import dbClient from '@dg/api/server/networkClients/dbClient';
import { StravaDetailedActivity } from '@dg/api/types/StravaDetailedActivity';
import paredStravaActivity from './paredStravaActivity';

/**
 * Used to convert a JsonValue from Prisma into an activity.
 */
const isStravaActivity = (
  activity: unknown,
): activity is StravaDetailedActivity & Prisma.JsonObject =>
  isRecord(activity) && typeof activity.id === 'number' && typeof activity.type === 'string';

/**
 * Fetch latest version of the activity from Strava's API
 */
const fetchLatestStravaActivityFromDb = async () => {
  const data = await dbClient.stravaActivity.findFirst({
    select: {
      activityData: true,
    },
    orderBy: {
      activityStartDate: 'desc',
    },
  });
  const activity = data?.activityData;
  if (isStravaActivity(activity)) {
    return paredStravaActivity(activity);
  }
  return null;
};

export default fetchLatestStravaActivityFromDb;
