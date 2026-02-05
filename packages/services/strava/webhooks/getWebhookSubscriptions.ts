import 'server-only';

import { listSubscriptions } from './listSubscriptions';

/**
 * Subscription metadata (IDs are never exposed).
 */
export type WebhookSubscriptionMetadata = {
  callbackUrl: string;
  createdAt: string;
};

/**
 * Lists Strava webhook subscriptions.
 * Returns only non-sensitive metadata (no IDs).
 */
export async function getWebhookSubscriptions(): Promise<Array<WebhookSubscriptionMetadata>> {
  const subscriptions = await listSubscriptions('strava');
  return subscriptions.map((subscription) => ({
    callbackUrl: subscription.callback_url,
    createdAt: subscription.created_at,
  }));
}
