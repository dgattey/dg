import { processStravaWebhookEvent } from '@dg/services/strava/webhooks/processStravaWebhookEvent';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { jsonError } from '../apiResponses';

const isStravaWebhookPayload = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const record = body as Record<string, unknown>;
  return (
    'aspect_type' in record ||
    'object_id' in record ||
    'object_type' in record ||
    'subscription_id' in record
  );
};

const parseWebhookBody = async (request: NextRequest): Promise<unknown | null> => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

/**
 * Processes a new webhook event posted to this endpoint and acknowledges receipt.
 * Validates the subscription_id against known subscriptions to prevent fake events.
 */
export async function handleWebhookPost(request: NextRequest): Promise<NextResponse> {
  const body = await parseWebhookBody(request);
  log.info('Received webhook POST', { body });

  if (body === null) {
    return jsonError('Bad Request', 400);
  }

  if (!isStravaWebhookPayload(body)) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const result = await processStravaWebhookEvent(body);
    switch (result.status) {
      case 'bad-request':
        return jsonError('Bad Request', 400);
      case 'forbidden':
        return jsonError('Forbidden', 403);
      case 'ok':
        if (result.shouldRevalidate) {
          revalidateTag('latest-activity', 'max');
        }
        return new NextResponse(null, { status: 200 });
    }
  } catch (error) {
    log.error('Failed to sync Strava webhook event', { error });
    return jsonError('Failed to sync Strava webhook', 500);
  }
}
