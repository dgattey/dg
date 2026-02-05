import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { redirect } from 'next/navigation';

/**
 * Wraps a promise and redirects to the dev console in development
 * if a MissingTokenError is thrown. This allows developers to
 * easily set up OAuth tokens when they're missing.
 *
 * In production, the error is re-thrown to be handled by error boundaries.
 */
export async function withDevTokenRedirect<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect(devConsoleRoute);
    }
    throw error;
  }
}
