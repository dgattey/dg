import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { processStravaWebhookEvent } from '@dg/services/strava/webhooks/processStravaWebhookEvent';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { jsonError } from '../apiResponses';

const isStravaChallengeRequest = (query: URLSearchParams) =>
  query.has('hub.challenge') || query.has('hub.mode') || query.has('hub.verify_token');

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

export function GET(request: NextRequest): NextResponse {
  const query = request.nextUrl.searchParams;
  log.info('Webhook GET request received', { query, url: request.url });

  if (!isStravaChallengeRequest(query)) {
    return new NextResponse(null, { status: 204 });
  }

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
    query,
  });
  return jsonError('Bad Request', 400);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
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
          revalidateTag('strava-history', 'max');
        }
        return new NextResponse(null, { status: 200 });
    }
  } catch (error) {
    log.error('Failed to sync Strava webhook event', { error });
    return jsonError('Failed to sync Strava webhook', 500);
  }
}
