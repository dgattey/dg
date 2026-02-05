'use server';

import { forceRefreshToken as forceRefreshTokenImpl } from '@dg/services/oauth/forceRefreshToken';
import type { ForceRefreshResult, OauthProvider } from '@dg/services/oauth/types';

/**
 * Server Action to force refresh an OAuth token.
 * Only available in development/test environments.
 */
export async function forceRefreshToken(provider: OauthProvider): Promise<ForceRefreshResult> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not available in production', success: false };
  }

  return await forceRefreshTokenImpl(provider);
}
