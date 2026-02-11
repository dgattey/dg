import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';

/**
 * Wraps a promise and returns null if a MissingTokenError is thrown.
 * This allows callers to gracefully degrade when OAuth tokens are missing.
 */
export async function withMissingTokenFallback<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isMissingTokenError(error)) {
      return null;
    }
    throw error;
  }
}
