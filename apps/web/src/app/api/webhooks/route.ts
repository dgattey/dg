import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { processStravaWebhookEvent } from '@dg/services/strava/webhooks/processStravaWebhookEvent';
import { log } from '@dg/shared-core/logging/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '../../../services/cacheTags';
import { isCronAuthorized, jsonError } from '../apiResponses';

const isStravaChallengeRequest = (query: URLSearchParams) =>
  query.has('hub.challenge') || query.has('hub.mode') || query.has('hub.verify_token');

const isContentfulWebhookPayload = (body: unknown) => {
  if (!body || typeof body !== 'object' || !('sys' in body)) {
    return false;
  }

  const { sys } = body;
  return Boolean(sys && typeof sys === 'object' && 'type' in sys && typeof sys.type === 'string');
};

const isContentfulWebhookRequest = (request: NextRequest, body: unknown) =>
  Boolean(
    request.headers.get('x-contentful-topic')?.trim() ||
      request.headers.get('x-contentful-webhook-name')?.trim(),
  ) || isContentfulWebhookPayload(body);

const isStravaWebhookPayload = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return false;
  }

  return (
    'aspect_type' in body ||
    'object_id' in body ||
    'object_type' in body ||
    'subscription_id' in body
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

  if (isContentfulWebhookRequest(request, body)) {
    if (!isCronAuthorized(request)) {
      log.warn('Unauthorized Contentful webhook request', {
        hasAuthHeader: request.headers.has('authorization'),
        topic: request.headers.get('x-contentful-topic'),
        webhookName: request.headers.get('x-contentful-webhook-name'),
      });
      return jsonError('Unauthorized', 401);
    }

    revalidateTag(CACHE_TAGS.contentful, 'max');
    revalidateTag(CACHE_TAGS.changelog, 'max');
    return NextResponse.json(
      { ok: true, revalidated: [CACHE_TAGS.contentful, CACHE_TAGS.changelog] },
      { status: 200 },
    );
  }

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
          revalidateTag(CACHE_TAGS.latestActivity, 'max');
          revalidateTag(CACHE_TAGS.stravaHistory, 'max');
        }
        return new NextResponse(null, { status: 200 });
    }
  } catch (error) {
    log.error('Failed to sync Strava webhook event', { error });
    return jsonError('Failed to sync Strava webhook', 500);
  }
}
