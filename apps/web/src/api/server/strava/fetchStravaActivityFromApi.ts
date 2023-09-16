import { stravaClient } from 'api/server/networkClients/stravaClient';
import type { StravaDetailedActivity } from 'api/types/StravaDetailedActivity';
import { paredStravaActivity } from './paredStravaActivity';

/**
 * Fetches an activity id from Strava's API. Use sparingly! Cuts into small API
 * budget. When in doubt, fall back to DB.
 */
export const fetchStravaActivityFromApi = async (id: number) => {
  const activity = await stravaClient.fetch<StravaDetailedActivity & Record<string, unknown>>(
    `activities/${id}`,
  );
  if (activity.status !== 200) {
    return null;
  }
  const allData = await activity.json();
  return paredStravaActivity(allData);
};
