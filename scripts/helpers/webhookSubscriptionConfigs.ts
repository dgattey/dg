import { WebhookSubscriptionConfig } from 'api/types/WebhookSubscriptionConfig';
import { WebhookType } from 'api/types/WebhookType';
import dotenv from 'dotenv';

// Load env variables from local file
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local` });

/**
 * These are the standard parameters that go into the body of
 * the request, coming from the config.
 */
export const standardParams = (config: WebhookSubscriptionConfig) => {
  const { id, secret } = config;
  if (!id || !secret) {
    throw new TypeError('Missing data');
  }
  return {
    client_id: id,
    client_secret: secret,
  };
};

/**
 * Configurations for the webhooks using mostly just env variables
 */
const webhookSubscriptionConfigs: Record<WebhookType, WebhookSubscriptionConfig> = {
  strava: {
    endpoint: 'https://www.strava.com/api/v3/push_subscriptions',
    id: process.env.STRAVA_CLIENT_ID,
    secret: process.env.STRAVA_CLIENT_SECRET,
    verifyToken: process.env.STRAVA_VERIFY_TOKEN,
    callbackUrl: process.env.WEBHOOK_CALLBACK_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  },
};

export default webhookSubscriptionConfigs;
