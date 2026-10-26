import 'server-only';

import { isDevConsoleAuthenticated } from '../auth/vercel/getVercelSession';

/**
 * Wraps a server action with dev console auth. Returns an unauthorized error
 * result if the request is not authenticated, otherwise runs the action.
 */
export async function withDevConsoleAuth<T extends { success: boolean; error?: string }>(
  action: (() => Promise<T>) | (() => T),
): Promise<T> {
  const isAuthorized = await isDevConsoleAuthenticated();
  if (!isAuthorized) {
    return { error: 'Unauthorized', success: false } as T;
  }

  return action();
}
