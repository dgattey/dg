import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import type { WebhookType } from './WebhookType';
import { standardParams, webhookSubscriptionConfigs } from './webhookSubscriptionConfigs';

/**
 * Deletes a webhook subscription with a given id.
 * Returns true on success, or throws on error.
 */
export async function deleteSubscription(
  type: WebhookType,
  subscriptionId: number,
): Promise<boolean> {
  const config = webhookSubscriptionConfigs[type];
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
      type,
    });
    throw new Error(
      `Failed to delete ${type} webhook subscription ${subscriptionId}: ${response.status}`,
    );
  }

  return true;
}
