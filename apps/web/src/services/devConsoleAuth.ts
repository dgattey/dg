import 'server-only';

import { isDevConsoleAccessAllowed } from '@dg/services/auth/devConsoleBasicAuth';
import { headers } from 'next/headers';

async function checkDevConsoleAuth(): Promise<boolean> {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get('authorization');
  return isDevConsoleAccessAllowed(authorization);
}

/**
 * Wraps a server action with dev console auth. Returns an unauthorized error
 * result if the request is not authenticated, otherwise runs the action.
 * Defense-in-depth layer behind the proxy Basic Auth check, needed because
 * server actions can be invoked directly via POST requests.
 */
export async function withDevConsoleAuth<T extends { success: boolean; error?: string }>(
  action: () => Promise<T>,
): Promise<T> {
  const isAuthorized = await checkDevConsoleAuth();
  if (!isAuthorized) {
    return { error: 'Unauthorized', success: false } as T;
  }

  return action();
}
