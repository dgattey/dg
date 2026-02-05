import {
  type StravaWebhookEvent,
  validateStravaWebhookEvent,
} from '@dg/content-models/strava/StravaWebhookEvent';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import {
  echoStravaChallengeIfValid,
  isValidSubscriptionId,
  syncStravaWebhookUpdateWithDb,
} from '../../../services/strava';

/**
 * Parity with the legacy pages router webhook handler:
 * - Challenge verification returns a 200 JSON response with hub.challenge.
 * - POST validates events and syncs activity updates.
 */

/**
 * Validates webhook event and logs detailed errors on failure.
 */
const isWebhookEvent = (body: unknown): body is StravaWebhookEvent => {
  const result = validateStravaWebhookEvent(body);
  if (!result.success) {
    log.error('Webhook validation failed', {
      body,
      issues: result.issues,
    });
  }
  return result.success;
};

const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

/**
 * Handles Strava webhook GET requests. This can be:
 * - A Strava subscription challenge verification
 */
export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  log.info('Webhook GET request received', { query, url: request.url });

  try {
    const challengeResponse = echoStravaChallengeIfValid(query);
    if (challengeResponse) {
      log.info('Strava challenge verified successfully');
      return NextResponse.json(challengeResponse, { status: 200 });
    }
  } catch (error) {
    log.error('Failed to validate Strava challenge', { error });
    return jsonError('Bad Request', 400);
  }

  log.info('Invalid Strava webhook GET - challenge validation failed', { query });
  return jsonError('Bad Request', 400);
}

/**
 * Processes a new webhook event posted to this endpoint and acknowledges receipt.
 * Validates the subscription_id against known subscriptions to prevent fake events.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  log.info('Received Strava webhook POST', { body });
  if (!isWebhookEvent(body)) {
    return jsonError('Bad Request', 400);
  }

  // Verify the subscription_id is from a known subscription
  // This prevents attackers from sending fake webhook events
  const subscriptionId = body.subscription_id;
  if (subscriptionId === undefined) {
    log.error('Webhook missing subscription_id');
    return jsonError('Bad Request', 400);
  }

  const isValid = await isValidSubscriptionId(subscriptionId);
  if (!isValid) {
    // Don't log the subscription ID - just log that it was invalid
    log.error('Webhook from unknown subscription');
    return jsonError('Forbidden', 403);
  }

  log.info('Processing valid webhook event', {
    aspectType: body.aspect_type,
    objectId: body.object_id,
    objectType: body.object_type,
  });
  // We don't handle auth/deauth events here.
  if (body.object_type === 'activity') {
    try {
      await syncStravaWebhookUpdateWithDb(body);
      revalidateTag('latest-activity', 'max');
    } catch (error) {
      log.error('Failed to sync Strava webhook event', { error });
      return jsonError('Failed to sync Strava webhook', 500);
    }
  }

  return new NextResponse(null, { status: 200 });
}
