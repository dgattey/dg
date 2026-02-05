'use server';

import { createSubscription } from '@dg/services/strava/webhooks/createSubscription';
import { deleteSubscription } from '@dg/services/strava/webhooks/deleteSubscription';
import { listSubscriptions } from '@dg/services/strava/webhooks/listSubscriptions';
import { log } from '@dg/shared-core/logging/log';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { revalidatePath } from 'next/cache';

type WebhookActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server Action to create a Strava webhook subscription.
 * Only available in development/test environments.
 */
export async function createWebhookSubscription(): Promise<WebhookActionResult> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not available in production', success: false };
  }

  try {
    await createSubscription('strava');
    revalidatePath(devConsoleRoute);
    return { success: true };
  } catch (error) {
    log.error('Failed to create webhook subscription', { error });
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    return { error: message, success: false };
  }
}

/**
 * Server Action to delete the current Strava webhook subscription.
 * Looks up the subscription ID server-side - no need to pass from client.
 * Only available in development/test environments.
 */
export async function deleteWebhookSubscription(): Promise<WebhookActionResult> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not available in production', success: false };
  }

  try {
    const subscriptions = await listSubscriptions('strava');
    const subscription = subscriptions[0];

    if (!subscription) {
      return { error: 'No subscription found to delete', success: false };
    }

    await deleteSubscription('strava', subscription.id);
    revalidatePath(devConsoleRoute);
    return { success: true };
  } catch (error) {
    log.error('Failed to delete webhook subscription', { error });
    const message = error instanceof Error ? error.message : 'Failed to delete subscription';
    return { error: message, success: false };
  }
}
