'use server';

import { forceRefreshToken as forceRefreshTokenImpl } from '@dg/services/oauth/forceRefreshToken';
import type { OauthProviderKey } from '@dg/shared-core/routes/oauth';
import type { ForceRefreshResult } from '@dg/services/oauth/types';

/**
 * Server Action to force refresh an OAuth token.
 * Only available in development/test environments.
 */
export async function forceRefreshToken(provider: OauthProviderKey): Promise<ForceRefreshResult> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Not available in production', success: false };
  }

  return await forceRefreshTokenImpl(provider);
}
