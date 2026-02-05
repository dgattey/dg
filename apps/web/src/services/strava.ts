import 'server-only';

import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { fetchLatestStravaActivityFromDb } from '@dg/services/strava/fetchLatestStravaActivityFromDb';
import { exchangeCodeForToken } from '@dg/services/strava/runOauthFlow';
import { syncStravaWebhookUpdateWithDb } from '@dg/services/strava/syncStravaWebhookUpdateWithDb';
import { listSubscriptions } from '@dg/services/strava/webhooks/listSubscriptions';
import { log } from '@dg/shared-core/logging/log';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { cacheLife, cacheTag } from 'next/cache';
import { withDevTokenRedirect } from './withDevTokenRedirect';

const LATEST_ACTIVITY_TAG = 'latest-activity';

/** Subscription metadata (IDs are never exposed). */
type SubscriptionMetadata = {
  callbackUrl: string;
  createdAt: string;
};

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

/**
 * Lists Strava webhook subscriptions.
 * Returns only non-sensitive metadata (no IDs).
 */
export async function getWebhookSubscriptions(): Promise<Array<SubscriptionMetadata>> {
  const subscriptions = await listSubscriptions('strava');
  return subscriptions.map((s) => ({
    callbackUrl: s.callback_url,
    createdAt: s.created_at,
  }));
}

/**
 * Checks if a subscription ID is valid for our Strava app.
 * Used internally for webhook verification - IDs never leave the server.
 */
export async function isValidSubscriptionId(subscriptionId: number): Promise<boolean> {
  try {
    const subscriptions = await listSubscriptions('strava');
    return subscriptions.some((s) => s.id === subscriptionId);
  } catch (error) {
    log.error('Failed to validate subscription ID', { error });
    return false;
  }
}

export { echoStravaChallengeIfValid, exchangeCodeForToken, syncStravaWebhookUpdateWithDb };
