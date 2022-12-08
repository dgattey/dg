import { NextApiRequest, NextApiResponse } from 'next';

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

// Types of methods allowed or disallowed
type HttpMethod = 'GET' | 'POST';

// Defaults to this if no error
const FALLBACK_ERROR = 'Error from API';

/**
 * 500s and tries to parse an error for an API endpoint. There might be a
 * few different ways the error is encoded, try most of the common ones.
 */
export const handleApiError = (
  response: NextApiResponse,
  error?: unknown,
  responseCode?: number,
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const typedError = error as ErrorType;
  const message =
    typeof typedError === 'string'
      ? typedError
      : typedError?.get?.() ?? typedError?.message ?? FALLBACK_ERROR;
  response.status(responseCode ?? 500).json({ error: message });
};

/**
 * Responds with a method not allowed error as needed.
 */
export const methodNotAllowedError = (
  request: NextApiRequest,
  response: NextApiResponse,
  allowedMethods: Array<HttpMethod>,
) => {
  const { method } = request;
  response.setHeader('Allow', allowedMethods);
  response.status(405).json({ error: method ? `Method ${method} Not Allowed` : 'Method Required' });
};
