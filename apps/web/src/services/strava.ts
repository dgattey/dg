import 'server-only';

import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';
import { withDevTokenRedirect } from './withDevTokenRedirect';

const LATEST_ACTIVITY_TAG = 'latest-activity';

/**
 * Gets the latest Strava activity with formatted relative time.
 */
export const getLatestActivity = async () => {
  'use cache';
  cacheLife('days');
  cacheTag(LATEST_ACTIVITY_TAG);
  const activity = await withDevTokenRedirect(fetchLatestStravaActivityFromDb());
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
