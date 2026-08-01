import 'server-only';

import type { WebhookSubscriptionConfig } from './WebhookSubscriptionConfig';

/**
 * These are the standard parameters that go into the body of
 * the request, coming from the config.
 */
export const standardParams = (config: WebhookSubscriptionConfig) => {
  const { id, secret } = config;
  if (!id || !secret) {
    throw new TypeError('Missing client_id or client_secret');
  }
  return {
    client_id: id,
    client_secret: secret,
  };
};

/**
 * Returns the Strava webhook subscription config, reading env vars at call time
 * so tests can set mock values before the config is evaluated.
 */
export function getWebhookSubscriptionConfig(): WebhookSubscriptionConfig {
  return {
    callbackUrl: process.env.STRAVA_WEBHOOK_CALLBACK_URL,
    endpoint: 'https://www.strava.com/api/v3/push_subscriptions',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    id: process.env.STRAVA_CLIENT_ID,
    secret: process.env.STRAVA_CLIENT_SECRET,
    verifyToken: process.env.STRAVA_VERIFY_TOKEN,
  };
}
