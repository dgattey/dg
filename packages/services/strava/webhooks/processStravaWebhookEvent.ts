import 'server-only';

import {
  type StravaWebhookEvent,
  validateStravaWebhookEvent,
} from '@dg/content-models/strava/StravaWebhookEvent';
import { log } from '@dg/shared-core/logging/log';
import { syncStravaWebhookUpdateWithDb } from '../syncStravaWebhookUpdateWithDb';
import { isValidSubscriptionId } from './isValidSubscriptionId';

export type StravaWebhookProcessResult =
  | { status: 'bad-request' }
  | { status: 'forbidden' }
  | { status: 'ok'; shouldRevalidate: boolean };

const validateWebhookEvent = (body: unknown): StravaWebhookEvent | null => {
  const result = validateStravaWebhookEvent(body);
  if (!result.success) {
    log.error('Webhook validation failed', {
      body,
      issues: result.issues,
    });
    return null;
  }
  return result.output;
};

const getSubscriptionId = (event: StravaWebhookEvent): number | null => {
  const subscriptionId = event.subscription_id;
  if (subscriptionId === undefined) {
    log.error('Webhook missing subscription_id');
    return null;
  }
  return subscriptionId;
};

export async function processStravaWebhookEvent(
  body: unknown,
): Promise<StravaWebhookProcessResult> {
  const event = validateWebhookEvent(body);
  if (!event) {
    return { status: 'bad-request' };
  }

  const subscriptionId = getSubscriptionId(event);
  if (subscriptionId === null) {
    return { status: 'bad-request' };
  }

  const isValid = await isValidSubscriptionId(subscriptionId);
  if (!isValid) {
    // Don't log the subscription ID - just log that it was invalid
    log.error('Webhook from unknown subscription');
    return { status: 'forbidden' };
  }

  log.info('Processing valid webhook event', {
    aspectType: event.aspect_type,
    objectId: event.object_id,
    objectType: event.object_type,
  });

  if (event.object_type === 'activity') {
    await syncStravaWebhookUpdateWithDb(event);
    return { shouldRevalidate: true, status: 'ok' };
  }

  return { shouldRevalidate: false, status: 'ok' };
}
