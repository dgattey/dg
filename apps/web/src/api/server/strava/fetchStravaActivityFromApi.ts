import type { StravaDetailedActivity } from 'db/models/StravaDetailedActivity';
import { stravaClient } from 'api/server/strava/stravaClient';
import { paredStravaActivity } from './paredStravaActivity';

/**
 * Fetches an activity id from Strava's API. Use sparingly! Cuts into small API
 * budget. When in doubt, fall back to DB.
 */
export const fetchStravaActivityFromApi = async (id: number) => {
  const { response, status } = await stravaClient.get(`activities/${id}`);
  if (status !== 200) {
    return null;
  }
  const allData = await response.json<StravaDetailedActivity & Record<string, unknown>>();
  return paredStravaActivity(allData);
};
