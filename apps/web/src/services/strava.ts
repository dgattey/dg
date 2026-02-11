import 'server-only';

import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';
import { withMissingTokenFallback } from './withMissingTokenFallback';

const LATEST_ACTIVITY_TAG = 'latest-activity';

/**
 * Gets the latest Strava activity with formatted relative time.
 * Returns null if tokens are missing.
 */
export const getLatestActivity = async () => {
  'use cache';
  cacheLife('days');
  cacheTag(LATEST_ACTIVITY_TAG);
  const activity = await withMissingTokenFallback(fetchLatestStravaActivityFromDb());
  if (!activity?.startDate) {
    return activity;
  }
  return {
    ...activity,
    relativeStartDate: formatRelativeTime({
      fromDate: activity.startDate,
      toDate: new Date(),
    }),
  };
};
