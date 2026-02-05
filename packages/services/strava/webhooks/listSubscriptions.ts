import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import type { WebhookType } from './WebhookType';
import { getWebhookSubscriptionConfig, standardParams } from './webhookSubscriptionConfigs';

/**
 * A webhook subscription returned from Strava's API
 */
export type WebhookSubscription = {
  id: number;
  callback_url: string;
  created_at: string;
  application_id: number;
  resource_state: number;
};

/**
 * Lists all current subscriptions for a webhook type.
 * Returns an array of subscriptions, or throws on error.
 */
export async function listSubscriptions(type: WebhookType): Promise<Array<WebhookSubscription>> {
  const config = getWebhookSubscriptionConfig(type);
  const { endpoint, headers } = config;

  const url = new URL(endpoint);
  url.search = new URLSearchParams(standardParams(config)).toString();

  const response = await fetch(url.toString(), {
    headers,
    method: 'GET',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    log.error('Failed to list webhook subscriptions', {
      body: errorBody,
      status: response.status,
      type,
    });
    throw new Error(`Failed to list ${type} webhook subscriptions: ${response.status}`);
  }

  const subscriptions = (await response.json()) as Array<WebhookSubscription>;
  return subscriptions;
}
