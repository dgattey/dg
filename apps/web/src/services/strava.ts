import 'server-only';

import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { getStravaOauthStatus } from '@dg/services/strava/getStravaOauthStatus';
import { exchangeCodeForToken, getOauthTokenInitLink } from '@dg/services/strava/runOauthFlow';
import { syncStravaWebhookUpdateWithDb } from '@dg/services/strava/syncStravaWebhookUpdateWithDb';
import { createSubscription as createWebhookSubscription } from '@dg/services/strava/webhooks/createSubscription';
import { deleteSubscription as deleteWebhookSubscription } from '@dg/services/strava/webhooks/deleteSubscription';
import { listSubscriptions as listWebhookSubscriptions } from '@dg/services/strava/webhooks/listSubscriptions';
import { maskSecret } from '@dg/shared-core/helpers/maskSecret';
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
  createWebhookSubscription,
  deleteWebhookSubscription,
  echoStravaChallengeIfValid,
  exchangeCodeForToken,
  getOauthTokenInitLink,
  getStravaOauthStatus,
  listWebhookSubscriptions,
  maskSecret,
  syncStravaWebhookUpdateWithDb,
};
