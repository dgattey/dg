import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import {
  mapStravaActivityFromApi,
  normalizeStravaActivity,
  stravaActivityApiSchema,
  stravaActivitySchema,
} from '@dg/content-models/strava/StravaActivity';
import { isRecord } from '@dg/shared-core/types/typeguards';
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
 * Reads one `StravaActivity` row. Current rows store the camelCase domain
 * shape; older rows stored Strava's raw snake_case payload, so both parse.
 * The `activityStartDate` column fills in a payload that lacks `startDate`.
 */
export const parseStoredStravaActivity = (
  activityData: unknown,
  activityStartDate: unknown,
): StravaActivity | null => {
  if (!isRecord(activityData)) {
    return null;
  }

  const parsed = safeParse(stravaActivitySchema, activityData);
  if (hasDomainDates(activityData) && parsed.success) {
    return withStartDateFallback(normalizeStravaActivity(parsed.output), activityStartDate);
  }

  const parsedApi = safeParse(stravaActivityApiSchema, activityData);
  if (hasApiStartDate(activityData) && parsedApi.success) {
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
