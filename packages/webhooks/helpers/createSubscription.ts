import fetch from 'node-fetch';
import type { WebhookType } from '../types/WebhookType';
import { handledError } from './handledError';
import { standardParams, webhookSubscriptionConfigs } from './webhookSubscriptionConfigs';

/**
 * Runs create, assuming that there's something running at the right
 * URL for the webhook to call back to.
 */
export const createSubscription = async (type: WebhookType) => {
  const config = webhookSubscriptionConfigs[type];
  const { endpoint, verifyToken, callbackUrl, headers } = config;
  if (!verifyToken || !callbackUrl) {
    throw new TypeError('Missing data');
  }

  const data = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: new URLSearchParams({
      ...standardParams(config),
      verify_token: verifyToken,
      callback_url: callbackUrl,
    }),
  });

  // Handle any errors or print out success
  if (await handledError(type, data)) {
    return;
  }
  console.log('✅ Successfully created subscription: ', await data.json());
};
