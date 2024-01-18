import type { NextApiRequest, NextApiResponse } from 'next';
import { isRecord } from 'shared-core/helpers/typeguards';
import { echoStravaChallengeIfValid } from 'api/strava/echoStravaChallengeIfValid';
import { syncStravaWebhookUpdateWithDb } from 'api/strava/syncStravaWebhookUpdateWithDb';
import type { StravaWebhookEvent } from 'api/strava/StravaWebhookEvent';
import { log } from '@logtail/next';
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
  handleApiError(response, 'Bad Request', 400);
};

/**
 * Processes a new webhook event posted to this endpoint and acknlowedges
 * receipt of it.
 */
const handleWebhookEvent: AsyncProcessor = async (request, response) => {
  log.info('Received Strava webhook event');
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
 * Handles gets or posts to the webhook URL
 */
const handler: AsyncProcessor = async (request, response) => {
  const { method } = request;
  switch (method) {
    case 'GET':
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
