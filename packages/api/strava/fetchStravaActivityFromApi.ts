import type { StravaDetailedActivity } from 'db/models/StravaDetailedActivity';
import { log } from '@logtail/next';
import { stravaClient } from './stravaClient';
import { paredStravaActivity } from './paredStravaActivity';

/**
 * Fetches an activity id from Strava's API. Use sparingly! Cuts into small API
 * budget. When in doubt, fall back to DB.
 */
export const fetchStravaActivityFromApi = async (id: number) => {
  const { response, status } = await stravaClient.get(`activities/${id}`);
  log.info('Fetched Strava activity from API', { id, status });
  if (status !== 200) {
    return null;
  }
  const allData = await response.json<StravaDetailedActivity & Record<string, unknown>>();
  log.info('Fetched and parsed Strava activity from API', { id, allData });
  await log.flush();
  return paredStravaActivity(allData);
};
