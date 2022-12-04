import type { WebhookType } from 'api/types/WebhookType';
import fetch from 'node-fetch';
import handledError from './handledError';
import webhookSubscriptionConfigs, { standardParams } from './webhookSubscriptionConfigs';

/**
 * Lists all current subscriptions for a webhook type
 */
const listSubscriptions = async (type: WebhookType) => {
  const config = webhookSubscriptionConfigs[type];
  const { endpoint, headers } = config;

  const url = new URL(endpoint);
  url.search = new URLSearchParams(standardParams(config)).toString();
  const data = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });

  // Handle any errors or print the current subscriptions
  if (await handledError(type, data)) {
    return;
  }
  console.log('👉 Current subscriptions: ', await data.json());
};

export default listSubscriptions;
