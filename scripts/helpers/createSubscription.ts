import type { WebhookType } from 'api/types/WebhookType';
import fetch from 'node-fetch';
import handledError from './handledError';
import webhookSubscriptionConfigs, { standardParams } from './webhookSubscriptionConfigs';

/**
 * Runs create, assuming that there's something running at the right
 * URL for the webhook to call back to.
 */
const createSubscription = async (type: WebhookType) => {
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

export default createSubscription;
