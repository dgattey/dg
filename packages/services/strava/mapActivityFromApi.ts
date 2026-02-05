import 'server-only';

import type { StravaActivity, StravaActivityApi } from '@dg/content-models/strava/StravaActivity';
import {
  mapStravaActivityFromApi,
  stravaActivityApiSchema,
} from '@dg/content-models/strava/StravaActivity';
import { parse } from 'valibot';

/**
 * Converts a Strava API response (snake_case) to a domain object (camelCase).
 * Only used for API responses - DB data is handled separately in fetchLatestStravaActivityFromDb.
 */
export const mapActivityFromApi = (
  activity: StravaActivityApi | null | undefined,
): StravaActivity | null => {
  if (!activity) {
    return null;
  }
  const validated = parse(stravaActivityApiSchema, activity);
  return mapStravaActivityFromApi(validated);
};
