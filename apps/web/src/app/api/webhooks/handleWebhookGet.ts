import { echoStravaChallengeIfValid } from '@dg/services/strava/echoStravaChallengeIfValid';
import { log } from '@dg/shared-core/logging/log';
import { type NextRequest, NextResponse } from 'next/server';
import { jsonError } from '../apiResponses';

const isStravaChallengeRequest = (query: URLSearchParams) =>
  query.has('hub.challenge') || query.has('hub.mode') || query.has('hub.verify_token');

/**
 * Handles Strava webhook GET requests. This can be:
 * - A Strava subscription challenge verification
 */
export function handleWebhookGet(request: NextRequest): NextResponse {
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
