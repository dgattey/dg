import 'server-only';

import { maskSecret } from '@dg/services/clients/maskSecret';
import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import {
  exchangeCodeForToken,
  getOauthTokenInitLink,
  getStravaExchangeCodeForTokenRequest,
} from '@dg/services/strava/runOauthFlow';
import { syncStravaWebhookUpdateWithDb } from '@dg/services/strava/syncStravaWebhookUpdateWithDb';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';

const LATEST_ACTIVITY_TAG = 'latest-activity';

export const getLatestActivity = async () => {
  'use cache';
  cacheLife('days');
  cacheTag(LATEST_ACTIVITY_TAG);
  const activity = await fetchLatestStravaActivityFromDb();
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

export {
  echoStravaChallengeIfValid,
  exchangeCodeForToken,
  getOauthTokenInitLink,
  getStravaExchangeCodeForTokenRequest,
  maskSecret,
  syncStravaWebhookUpdateWithDb,
};

