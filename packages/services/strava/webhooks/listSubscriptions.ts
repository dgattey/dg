import 'server-only';

import { StravaApiError } from '@dg/shared-core/errors/StravaApiError';
import { log } from '@dg/shared-core/logging/log';
import { parseStravaError } from './parseStravaError';
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
 * Lists all current Strava webhook subscriptions.
 * Returns an array of subscriptions, or throws a `StravaApiError` when Strava
 * rejects the request so callers can tell an API refusal apart from a bug.
 */
export async function listSubscriptions(): Promise<Array<WebhookSubscription>> {
  const config = getWebhookSubscriptionConfig();
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
    });
    throw new StravaApiError(parseStravaError(response.status, errorBody), response.status);
  }

  const subscriptions = (await response.json()) as Array<WebhookSubscription>;
  return subscriptions;
}
