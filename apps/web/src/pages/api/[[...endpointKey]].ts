import { endpoints, isValid } from 'api/endpoints';
import { handleApiError, methodNotAllowedError } from 'api/handleApiError';
import type { NextApiRequest, NextApiResponse } from 'next';

// Just a shorthand for this function type
type Processor = (request: NextApiRequest, response: NextApiResponse) => Promise<void>;

/**
 * Takes a request and transforms the endpoint key out of it, joining any
 * sub paths with forward slashes to form a valid key.
 */
const parseEndpointKey = (request: NextApiRequest) => {
  const {
    query: { endpointKey: rawKey },
  } = request;
  return typeof rawKey === 'string' ? rawKey : rawKey?.join('/');
};

/**
 * For a GET request, awaits data from the fetcher function or returns a 500 if there's no
 * query specified in the body.
 */
const handleGet: Processor = async (request, response) => {
  const endpointKey = parseEndpointKey(request);
  if (!isValid(endpointKey)) {
    handleApiError(response, 'Malformed endpoint key');
    return;
  }
  try {
    const data = await endpoints[endpointKey]();
    response.json(data);
  } catch (error) {
    handleApiError(response, error);
  }
};

/**
 * Handles gets only, with valid endpoint keys.
 */
const handler: Processor = async (request, response) => {
  const { method } = request;
  switch (method) {
    case 'GET': {
      await handleGet(request, response);
      return;
    }
    default:
      methodNotAllowedError(request, response, ['GET']);
  }
};

export default handler;
