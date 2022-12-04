import type { WebhookType } from 'api/types/WebhookType';
import fetch from 'node-fetch';
import handledError from './handledError';
import webhookSubscriptionConfigs, { standardParams } from './webhookSubscriptionConfigs';

/**
 * Deletes a subscription with a given id. Use `pnpm webhooks:list` to see
 * what's available.
 */
const deleteSubscription = async (type: WebhookType, subscriptionId: string) => {
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

export default deleteSubscription;
