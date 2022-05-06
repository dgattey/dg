import { withSentry as builtInWithSentry } from '@sentry/nextjs';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type ResponseWithAsyncEnd = { end: (cb?: (() => void) | undefined) => Promise<void> };

/**
 * This replaces Sentry's `withSentry` wrapper for API calls to make Next happy and
 * properly end with a `response.end` call. Without, we get false positives for
 * `API resolved without sending a response` even though we definitely do.
 *
 * IMPORTANT: with Sentry wrapper, response.end becomes async, so it needs to be awaited
 * and the types need to be asserted to do so because Sentry has no built in types
 */
const withSentry =
  (handler: NextApiHandler) => async (request: NextApiRequest, response: NextApiResponse) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const asyncEndResponse = response as unknown as ResponseWithAsyncEnd;
    await builtInWithSentry(handler)(request, response);
    await asyncEndResponse.end();
  };

export default withSentry;
