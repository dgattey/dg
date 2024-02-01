import type { NextApiRequest, NextApiResponse } from 'next';
import { isRecord } from 'shared-core/helpers/typeguards';
import { echoStravaChallengeIfValid } from 'api/strava/echoStravaChallengeIfValid';
import { syncStravaWebhookUpdateWithDb } from 'api/strava/syncStravaWebhookUpdateWithDb';
import type { StravaWebhookEvent } from 'api/strava/StravaWebhookEvent';
import { log } from '@logtail/next';
import {
  exchangeCodeForToken,
  getOauthTokenInitLink,
  getStravaExchangeCodeForTokenRequest,
} from 'api/strava/runOauthFlow';
import { handleApiError, methodNotAllowedError } from 'api/handleApiError';

// Just a shorthand for this function type
type Processor = (request: NextApiRequest, response: NextApiResponse) => void;
type AsyncProcessor = (request: NextApiRequest, response: NextApiResponse) => Promise<void>;

/**
 * Checks most data to see if it's a webhook event
 */
const isWebhookEvent = (body: unknown): body is StravaWebhookEvent => {
  log.info('Is this a webhook event?', { body });
  if (!isRecord(body)) {
    return false;
  }
  return (
    typeof body.object_id === 'number' &&
    typeof body.aspect_type === 'string' &&
    typeof body.object_type === 'string'
  );
};

/**
 * If a GET request is a challege, check to see if it's typed right. Otherwise,
 * fail with a 400.
 */
const handleGet: Processor = (request, response) => {
  log.info('Received Strava webhook GET');
  if (echoStravaChallengeIfValid(request, response)) {
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    log.info('Received Strava webhook GET in development mode');
    const html = `
      <h1>Development mode shortcuts</h1>
      <h2>Strava</h2>
      <a href="${getOauthTokenInitLink()}">Start OAuth flow</a>
    `;
    response.status(200).setHeader('Content-Type', 'text/html').end(html);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  log.info('Invalid Strava webhook GET', { body: request.body as unknown });
  handleApiError(response, 'Bad Request', 400);
};

/**
 * Processes a new webhook event posted to this endpoint and acknlowedges
 * receipt of it.
 */
const handleWebhookEvent: AsyncProcessor = async (request, response) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  log.info('Received Strava webhook event', { body: request.body as unknown });
  if (!isWebhookEvent(request.body)) {
    log.error('Received invalid Strava webhook event');
    handleApiError(response, 'Bad Request', 400);
    return;
  }

  const webhookEvent = request.body;
  log.info('Got webhook event', { webhookEvent });
  switch (webhookEvent.object_type) {
    case 'athlete':
      // We don't handle auth/deauth events
      break;
    case 'activity': {
      // Get the DB data up to date
      await syncStravaWebhookUpdateWithDb(request.body);
    }
  }

  // Make sure to respond to Strava with the result
  response.status(200).end();
};

/**
 * Processes a token exchange if necessary.
 */
async function handleTokenExchange(
  request: NextApiRequest,
  response: NextApiResponse,
): Promise<boolean> {
  const code = getStravaExchangeCodeForTokenRequest(request.query);
  if (!code) {
    // Just means we have a normal webhook event
    return false;
  }

  log.info('Received token exchange webhook event', { code });
  try {
    const html = await exchangeCodeForToken(code);
    response.status(200).setHeader('Content-Type', 'text/html').end(html);
  } catch (error) {
    log.error('Failed to exchange code for token', { error });
    handleApiError(response, 'Could not generate oauth token', 500);
  }
  return true;
}

/**
 * Handles gets or posts to the webhook URL
 */
const handler: AsyncProcessor = async (request, response) => {
  const { method } = request;
  switch (method) {
    case 'GET':
      if (await handleTokenExchange(request, response)) {
        return;
      }
      handleGet(request, response);
      return;
    case 'POST':
      await handleWebhookEvent(request, response);
      return;
    default:
      methodNotAllowedError(request, response, ['GET', 'POST']);
  }
};

export default handler;
