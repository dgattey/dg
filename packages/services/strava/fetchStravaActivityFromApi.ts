import { stravaActivityApiSchema } from '@dg/content-models/strava/StravaActivity';
import { log } from '@dg/shared-core/helpers/log';
import { parseResponse } from '../clients/parseResponse';
import { mapActivityFromApi } from './paredStravaActivity';
import { stravaClient } from './stravaClient';

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
  const apiData = parseResponse(stravaActivityApiSchema, await response.json(), {
    kind: 'rest',
    source: 'strava.fetchStravaActivityFromApi',
  });
  log.info('Fetched and parsed Strava activity from API', { apiData, id });
  return mapActivityFromApi(apiData);
};
