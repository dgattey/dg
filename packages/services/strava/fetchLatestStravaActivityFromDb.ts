import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import {
  mapStravaActivityFromApi,
  normalizeStravaActivity,
  stravaActivityApiSchema,
  stravaActivitySchema,
} from '@dg/content-models/strava/StravaActivity';
import { db } from '@dg/db';
import { isRecord } from '@dg/shared-core/helpers/typeguards';
import { safeParse } from 'valibot';

const hasDomainDates = (activity: Record<string, unknown>) =>
  'startDate' in activity || 'relativeStartDate' in activity;

const hasApiStartDate = (activity: Record<string, unknown>) => 'start_date' in activity;

const toStartDate = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

const withStartDateFallback = (
  activity: StravaActivity,
  activityStartDate: unknown,
): StravaActivity => {
  if (activity.startDate) {
    return activity;
  }
  const fallbackStartDate = toStartDate(activityStartDate);
  if (!fallbackStartDate) {
    return activity;
  }
  return { ...activity, startDate: fallbackStartDate };
};

/**
 * Fetch latest version of the activity from Strava's API
 */
export const fetchLatestStravaActivityFromDb = async () => {
  const data = await db.StravaActivity.findOne({
    attributes: ['activityData', 'activityStartDate'],
    order: [['activityStartDate', 'DESC']],
  });
  const activity = data?.activityData;
  const activityStartDate = data?.activityStartDate;
  if (!isRecord(activity)) {
    return null;
  }

  const parsed = safeParse(stravaActivitySchema, activity);
  if (hasDomainDates(activity) && parsed.success) {
    return withStartDateFallback(normalizeStravaActivity(parsed.output), activityStartDate);
  }

  const parsedApi = safeParse(stravaActivityApiSchema, activity);
  if (hasApiStartDate(activity) && parsedApi.success) {
    return withStartDateFallback(mapStravaActivityFromApi(parsedApi.output), activityStartDate);
  }

  if (parsed.success) {
    return withStartDateFallback(normalizeStravaActivity(parsed.output), activityStartDate);
  }

  if (parsedApi.success) {
    return withStartDateFallback(mapStravaActivityFromApi(parsedApi.output), activityStartDate);
  }

  return null;
};
