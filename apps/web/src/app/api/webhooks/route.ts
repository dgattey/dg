import {
  isStravaWebhookEvent,
  type StravaWebhookEvent,
} from '@dg/content-models/strava/StravaWebhookEvent';
import { log } from '@dg/shared-core/helpers/log';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import {
  echoStravaChallengeIfValid,
  exchangeCodeForToken,
  getOauthTokenInitLink,
  getStravaExchangeCodeForTokenRequest,
  maskSecret,
  syncStravaWebhookUpdateWithDb,
} from '../../../services/strava';

type QueryRecord = Partial<Record<string, string | Array<string>>>;

/**
 * Parity with the legacy pages router webhook handler:
 * - Token exchange checks state/code/scope and returns HTML.
 * - Challenge verification returns a 200 JSON response with hub.challenge.
 * - Dev mode shows the same OAuth shortcut HTML.
 * - POST validates events and syncs activity updates.
 */

const toQueryRecord = (searchParams: URLSearchParams): QueryRecord =>
  Object.fromEntries(searchParams.entries());

/**
 * Checks most data to see if it's a webhook event.
 */
const isWebhookEvent = (body: unknown): body is StravaWebhookEvent => {
  log.info('Is this a webhook event?', { body });
  return isStravaWebhookEvent(body);
};

const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

/**
 * Handles Strava webhook GET requests. This can be:
 * - A token exchange callback for the OAuth flow
 * - A Strava subscription challenge verification
 * - A development-only shortcut to kick off OAuth
 */
export async function GET(request: NextRequest) {
  const query = toQueryRecord(request.nextUrl.searchParams);
  const code = getStravaExchangeCodeForTokenRequest(query);

  if (code) {
    log.info('Received token exchange webhook event', { code: maskSecret(code) });
    try {
      const html = await exchangeCodeForToken(code);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      });
    } catch (error) {
      log.error('Failed to exchange code for token', { error });
      return jsonError('Could not generate oauth token', 500);
    }
  }

  try {
    const challengeResponse = echoStravaChallengeIfValid(request.nextUrl.searchParams);
    if (challengeResponse) {
      return NextResponse.json(challengeResponse, { status: 200 });
    }
  } catch (error) {
    log.error('Failed to validate Strava challenge', { error });
    return jsonError('Bad Request', 400);
  }

  if (process.env.NODE_ENV === 'development') {
    log.info('Received Strava webhook GET in development mode');
    try {
      const html = `
        <h1>Development mode shortcuts</h1>
        <h2>Strava</h2>
        <a href="${getOauthTokenInitLink()}">Start OAuth flow</a>
      `;
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      });
    } catch (error) {
      log.error('Strava OAuth flow not configured', { error });
      return jsonError('Strava OAuth not configured', 500);
    }
  }

  log.info('Invalid Strava webhook GET', { query });
  return jsonError('Bad Request', 400);
}

/**
 * Processes a new webhook event posted to this endpoint and acknowledges receipt.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  log.info('Received Strava webhook event', { body });
  if (!isWebhookEvent(body)) {
    log.error('Received invalid Strava webhook event');
    return jsonError('Bad Request', 400);
  }

  log.info('Got webhook event', { webhookEvent: body });
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
