import 'server-only';

import { StravaApiError } from '@dg/shared-core/errors/StravaApiError';
import { log } from '@dg/shared-core/logging/log';
import type { WebhookSubscription } from './listSubscriptions';
import { parseStravaError } from './parseStravaError';
import { getWebhookSubscriptionConfig, standardParams } from './webhookSubscriptionConfigs';

/**
 * Creates a Strava webhook subscription.
 * Assumes there's something running at the callback URL for the webhook to call back to.
 * Returns the created subscription, or throws a `StravaApiError` on refusal.
 */
export async function createSubscription(): Promise<WebhookSubscription> {
  const config = getWebhookSubscriptionConfig();
  const { endpoint, verifyToken, callbackUrl, headers } = config;

  if (!verifyToken || !callbackUrl) {
    throw new TypeError('Missing verifyToken or callbackUrl in webhook config');
  }

  const params = new URLSearchParams({
    ...standardParams(config),
    callback_url: callbackUrl,
    verify_token: verifyToken,
  });

  log.info('Creating webhook subscription', {
    callbackUrl,
    endpoint,
    params: {
      callback_url: callbackUrl,
      client_id: config.id,
      verify_token: verifyToken,
    },
    verifyToken,
  });

  const response = await fetch(endpoint, {
    body: params,
    headers,
    method: 'POST',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    log.error('Failed to create webhook subscription', {
      body: errorBody,
      callbackUrl,
      status: response.status,
    });
    const userMessage = parseStravaError(response.status, errorBody, callbackUrl);
    throw new StravaApiError(userMessage, response.status);
  }

  const subscription = (await response.json()) as WebhookSubscription;
  return subscription;
}
