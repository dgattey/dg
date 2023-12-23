import fetch from 'node-fetch';
import type { WebhookType } from '../types/WebhookType';
import { handledError } from './handledError';
import { webhookSubscriptionConfigs, standardParams } from './webhookSubscriptionConfigs';

/**
 * Deletes a subscription with a given id. Use the `list` command to see
 * what's available.
 */
export const deleteSubscription = async (type: WebhookType, subscriptionId: string) => {
  const config = webhookSubscriptionConfigs[type];
  const { endpoint, headers } = config;

  const url = new URL(`${endpoint}/${subscriptionId}`);
  url.search = new URLSearchParams(standardParams(config)).toString();
  const data = await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  });

  // Handle any errors or print the current subscriptions
  if (await handledError(type, data)) {
    return;
  }
  console.log(`✅ Deleted subscription with id '${subscriptionId}': `, await data.text());
};
