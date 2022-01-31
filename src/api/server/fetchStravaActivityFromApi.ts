import type { StravaDetailedActivity } from 'api/types/StravaDetailedActivity';
import stravaClient from './stravaClient';

/**
 * Fetches an activity id from Strava's API. Use sparingly! Cuts into small API
 * budget. When in doubt, fall back to DB.
 */
const fetchStravaActivityFromApi = async (id: number) => {
  const activity = await stravaClient.fetch<StravaDetailedActivity>(`activities/${id}`);
  if (activity.status !== 200) {
    return null;
  }
  return activity.json();
};

export default fetchStravaActivityFromApi;
