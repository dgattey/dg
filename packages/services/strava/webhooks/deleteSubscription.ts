import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import { getWebhookSubscriptionConfig, standardParams } from './webhookSubscriptionConfigs';

/**
 * Deletes a Strava webhook subscription with a given id.
 * Returns true on success, or throws on error.
 */
export async function deleteSubscription(subscriptionId: number): Promise<boolean> {
  const config = getWebhookSubscriptionConfig();
  const { endpoint, headers } = config;

  const url = new URL(`${endpoint}/${subscriptionId}`);
  url.search = new URLSearchParams(standardParams(config)).toString();

  const response = await fetch(url.toString(), {
    headers,
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    log.error('Failed to delete webhook subscription', {
      body: errorBody,
      status: response.status,
      subscriptionId,
    });
    throw new Error(
      `Failed to delete Strava webhook subscription ${subscriptionId}: ${response.status}`,
    );
  }

  return true;
}
