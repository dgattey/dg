import type { Prisma } from 'api/server/generated';
import stravaClient from 'api/server/networkClients/stravaClient';
import type { StravaDetailedActivity } from 'api/types/StravaDetailedActivity';

/**
 * Fetches an activity id from Strava's API. Use sparingly! Cuts into small API
 * budget. When in doubt, fall back to DB.
 */
const fetchStravaActivityFromApi = async (id: number) => {
  const activity = await stravaClient.fetch<StravaDetailedActivity & Prisma.JsonObject>(
    `activities/${id}`,
  );
  if (activity.status !== 200) {
    return null;
  }
  return activity.json();
};

export default fetchStravaActivityFromApi;
