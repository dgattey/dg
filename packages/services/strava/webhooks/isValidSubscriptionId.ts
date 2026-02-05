import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { listSubscriptions } from './listSubscriptions';

/**
 * Checks if a subscription ID is valid for our Strava app.
 */
export async function isValidSubscriptionId(subscriptionId: number): Promise<boolean> {
  try {
    const subscriptions = await listSubscriptions('strava');
    return subscriptions.some((subscription) => subscription.id === subscriptionId);
  } catch (error) {
    log.error('Failed to validate subscription ID', { error });
    return false;
  }
}
