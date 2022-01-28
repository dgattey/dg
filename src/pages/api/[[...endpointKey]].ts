import endpoints, { isValid } from 'api/endpoints';
import type { NextApiRequest, NextApiResponse } from 'next';

// Just a shorthand for this function type
type Processor = (request: NextApiRequest, response: NextApiResponse) => Promise<void>;

/**
 * A bunch of different ways an error might be encoded. Check in order
 */
type ErrorType =
  | {
      get?: () => string;
      message?: string;
    }
  | string
  | undefined
  | null;

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
    response.status(500).end('Malformed endpoint key');
    return;
  }
  try {
    const data = await endpoints[endpointKey]();
    response.json(data);
  } catch (error: unknown) {
    // Might be a few different ways the error is encoded, try most of the common ones
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const typedError = error as ErrorType;
    const message =
      typeof typedError === 'string'
        ? typedError
        : typedError?.get?.() ?? typedError?.message ?? 'Error executing the call';
    response.status(500).end(message);
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
      response.setHeader('Allow', ['GET']);
      response.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
