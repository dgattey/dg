import type { StravaActivity, StravaActivityApi } from '@dg/content-models/strava/StravaActivity';
import {
  mapStravaActivityFromApi,
  normalizeStravaActivity,
  stravaActivityApiSchema,
  stravaActivitySchema,
} from '@dg/content-models/strava/StravaActivity';
import { isRecord } from '@dg/shared-core/helpers/typeguards';
import { safeParse } from 'valibot';

/**
 * Normalizes Strava activities into camelCase domain objects.
 */
export const paredStravaActivity = (
  activity: StravaActivity | StravaActivityApi | null | undefined,
): StravaActivity | null => {
  if (!activity || !isRecord(activity)) {
    return null;
  }

  const parsedActivity = safeParse(stravaActivitySchema, activity);
  if (parsedActivity.success) {
    return normalizeStravaActivity(parsedActivity.output);
  }

  const parsedApi = safeParse(stravaActivityApiSchema, activity);
  if (parsedApi.success) {
    return mapStravaActivityFromApi(parsedApi.output);
  }

  return null;
};
