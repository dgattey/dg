import 'server-only';

import { isStravaApiError } from '@dg/shared-core/errors/StravaApiError';
import { listSubscriptions } from './listSubscriptions';

/**
 * Subscription metadata (IDs are never exposed).
 */
export type WebhookSubscriptionMetadata = {
  callbackUrl: string;
  createdAt: string;
};

/**
 * Subscriptions plus the reason Strava refused to list them, if it did.
 * An error means the subscriptions are unknown, not that there are none.
 */
export type WebhookSubscriptionsStatus = {
  error: string | null;
  subscriptions: Array<WebhookSubscriptionMetadata>;
};

/**
 * Lists Strava webhook subscriptions, returning only non-sensitive metadata
 * (no IDs). A refusal from Strava — an inactive application, bad credentials —
 * comes back as an error to render rather than a throw, since the caller is a
 * page that should degrade to one broken card. Anything else still throws.
 */
export async function getWebhookSubscriptions(): Promise<WebhookSubscriptionsStatus> {
  try {
    const subscriptions = await listSubscriptions('strava');
    return {
      error: null,
      subscriptions: subscriptions.map((subscription) => ({
        callbackUrl: subscription.callback_url,
        createdAt: subscription.created_at,
      })),
    };
  } catch (error) {
    if (isStravaApiError(error)) {
      return { error: error.message, subscriptions: [] };
    }
    throw error;
  }
}
