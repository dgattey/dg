import fetch from 'node-fetch';
import type { WebhookType } from 'types/WebhookType';
import { handledError } from 'helpers/handledError';
import { webhookSubscriptionConfigs, standardParams } from 'helpers/webhookSubscriptionConfigs';

/**
 * Lists all current subscriptions for a webhook type
 */
export const listSubscriptions = async (type: WebhookType) => {
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
