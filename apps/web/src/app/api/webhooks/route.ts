import {
  type StravaWebhookEvent,
  validateStravaWebhookEvent,
} from '@dg/content-models/strava/StravaWebhookEvent';
import { log } from '@dg/shared-core/helpers/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import {
  echoStravaChallengeIfValid,
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
  log.info('Webhook GET request received', {
    query: query.toString(),
    url: request.url,
  });

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

  log.info('Invalid Strava webhook GET - challenge validation failed', {
    query: query.toString(),
  });
  return jsonError('Bad Request', 400);
}

/**
 * Processes a new webhook event posted to this endpoint and acknowledges receipt.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  log.info('Received Strava webhook POST', { body });
  if (!isWebhookEvent(body)) {
    return jsonError('Bad Request', 400);
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
