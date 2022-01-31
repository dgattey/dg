import handleApiError, { methodNotAllowedError } from 'api/handleApiError';
import echoStravaChallengeIfValid from 'api/server/echoStravaChallengeIfValid';
import type { StravaWebhookEvent } from 'api/types/StravaWebhookEvent';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isRecord } from '../../api/parsers';

// Just a shorthand for this function type
type Processor = (request: NextApiRequest, response: NextApiResponse) => void;

/**
 * Checks most data to see if it's a webhook event
 */
const isWebhookEvent = (body: unknown): body is StravaWebhookEvent => {
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
  if (echoStravaChallengeIfValid(request, response)) {
    return;
  }
  handleApiError(response, 'Bad Request', 400);
};

/**
 * Processes a new webhook event posted to this endpoint and acknlowedges
 * receipt of it.
 */
const handleWebhookEvent: Processor = (request, response) => {
  if (!isWebhookEvent(request.body)) {
    handleApiError(response, 'Bad Request', 400);
    return;
  }
  const webhookEvent = request.body;
  response.status(200).end();
};

/**
 * Handles gets or posts to the webhooks URL
 */
const handler: Processor = (request, response) => {
  const { method } = request;
  switch (method) {
    case 'GET':
      handleGet(request, response);
      return;
    case 'POST':
      handleWebhookEvent(request, response);
      return;
    default:
      methodNotAllowedError(request, response, ['GET', 'POST']);
  }
};

export default handler;
