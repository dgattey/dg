import 'server-only';

import { log } from '@dg/shared-core/logging/log';
import type { WebhookSubscription } from './listSubscriptions';
import type { WebhookType } from './WebhookType';
import { getWebhookSubscriptionConfig, standardParams } from './webhookSubscriptionConfigs';

type StravaErrorResponse = {
  errors?: Array<{
    code?: string;
    field?: string;
    resource?: string;
  }>;
  message?: string;
};

/**
 * Parses the Strava error response and returns a user-friendly message
 */
function parseStravaError(status: number, body: string, callbackUrl: string): string {
  let parsed: StravaErrorResponse | null = null;
  try {
    parsed = JSON.parse(body) as StravaErrorResponse;
  } catch {
    // Body isn't JSON, use raw
  }

  // Check for specific error codes from Strava
  const firstError = parsed?.errors?.[0];

  // "already exists" is a specific error code from Strava
  if (firstError?.code === 'already exists') {
    return 'A webhook subscription already exists for this app. Delete the existing subscription first.';
  }

  // Callback URL verification failed - Strava couldn't reach the URL
  if (firstError?.code === 'GET to callback URL does not return 200') {
    return `Strava could not reach the callback URL (${callbackUrl}). Make sure the Cloudflare tunnel is running (check for cloudflared in turbo dev output).`;
  }

  if (status === 401 || status === 403) {
    return 'Invalid Strava client credentials. Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.';
  }

  if (status === 400) {
    // 400 can mean various things - include Strava's actual error details
    const details = firstError?.code ?? parsed?.message ?? body;
    return `Strava rejected the request: ${details}`;
  }

  // Fallback to Strava's message or generic error
  if (parsed?.message) {
    return `Strava error: ${parsed.message}`;
  }

  return `Strava returned ${status}: ${body || 'Unknown error'}`;
}

/**
 * Creates a webhook subscription.
 * Assumes there's something running at the callback URL for the webhook to call back to.
 * Returns the created subscription, or throws on error.
 */
export async function createSubscription(type: WebhookType): Promise<WebhookSubscription> {
  const config = getWebhookSubscriptionConfig(type);
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
    type,
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
      type,
    });
    const userMessage = parseStravaError(response.status, errorBody, callbackUrl);
    throw new Error(userMessage);
  }

  const subscription = (await response.json()) as WebhookSubscription;
  return subscription;
}
