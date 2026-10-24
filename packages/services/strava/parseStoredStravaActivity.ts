import 'server-only';

import {
  normalizeStravaActivity,
  type StravaActivity,
  stravaActivitySchema,
} from '@dg/content-models/strava/StravaActivity';
import { safeParse } from 'valibot';

export const parseStoredStravaActivity = (activityData: unknown): StravaActivity | null => {
  const parsed = safeParse(stravaActivitySchema, activityData);
  return parsed.success ? normalizeStravaActivity(parsed.output) : null;
};
