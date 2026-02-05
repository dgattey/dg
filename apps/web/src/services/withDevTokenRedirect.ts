import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { CONSOLE_ROUTE } from '@dg/shared-core/routes/routes';
import { redirect } from 'next/navigation';

/**
 * Wraps a promise and redirects to the console in development
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
      redirect(CONSOLE_ROUTE);
    }
    throw error;
  }
}
