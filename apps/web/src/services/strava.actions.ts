'use server';

import {
  type StravaHistorySyncOutcome,
  syncStravaHistory,
} from '@dg/services/strava/syncStravaHistory';
import { createSubscription } from '@dg/services/strava/webhooks/createSubscription';
import { deleteSubscription } from '@dg/services/strava/webhooks/deleteSubscription';
import { listSubscriptions } from '@dg/services/strava/webhooks/listSubscriptions';
import { log } from '@dg/shared-core/logging/log';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './cacheTags';
import { withDevConsoleAuth } from './devConsoleAuth';

type WebhookActionResult = {
  success: boolean;
  error?: string;
};

type BackfillActionResult = WebhookActionResult & { message?: string };

const describeCounts = ({ inserted, pages, updated }: StravaHistorySyncOutcome) =>
  `${inserted} added, ${updated} updated, ${pages} ${pages === 1 ? 'page' : 'pages'} read.`;

const describeOutcome = (outcome: StravaHistorySyncOutcome): BackfillActionResult => {
  switch (outcome.status) {
    case 'ok':
      return { message: describeCounts(outcome), success: true };
    case 'failed': {
      const retry =
        outcome.retryAfterSeconds === undefined ? '' : ` Retry in ${outcome.retryAfterSeconds}s.`;
      return { error: `${outcome.reason}. ${describeCounts(outcome)}${retry}`, success: false };
    }
    default: {
      const unhandled: never = outcome;
      return unhandled;
    }
  }
};

/**
 * Server Action to create a Strava webhook subscription.
 * Requires dev console authentication.
 */
export async function createWebhookSubscription(): Promise<WebhookActionResult> {
  return await withDevConsoleAuth(async () => {
    try {
      await createSubscription();
      revalidatePath(devConsoleRoute);
      return { success: true };
    } catch (error) {
      log.error('Failed to create webhook subscription', { error });
      const message = error instanceof Error ? error.message : 'Failed to create subscription';
      return { error: message, success: false };
    }
  });
}

/**
 * Server Action to delete the current Strava webhook subscription.
 * Looks up the subscription ID server-side - no need to pass from client.
 * Requires dev console authentication.
 */
export async function deleteWebhookSubscription(): Promise<WebhookActionResult> {
  return await withDevConsoleAuth(async () => {
    try {
      const subscriptions = await listSubscriptions();
      const subscription = subscriptions[0];

      if (!subscription) {
        return { error: 'No subscription found to delete', success: false };
      }

      await deleteSubscription(subscription.id);
      revalidatePath(devConsoleRoute);
      return { success: true };
    } catch (error) {
      log.error('Failed to delete webhook subscription', { error });
      const message = error instanceof Error ? error.message : 'Failed to delete subscription';
      return { error: message, success: false };
    }
  });
}

/**
 * Server Action to backfill stored Strava history from the activities list.
 * A stopped run may still have saved pages, so both outcomes revalidate.
 * Requires dev console authentication.
 */
export async function backfillStravaHistory(): Promise<BackfillActionResult> {
  return await withDevConsoleAuth(async () => {
    try {
      const outcome = await syncStravaHistory();
      revalidateTag(CACHE_TAGS.stravaHistory, 'max');
      revalidateTag(CACHE_TAGS.latestActivity, 'max');
      return describeOutcome(outcome);
    } catch (error) {
      log.error('Failed to backfill Strava history', { error });
      const message = error instanceof Error ? error.message : 'Failed to backfill history';
      return { error: message, success: false };
    }
  });
}
