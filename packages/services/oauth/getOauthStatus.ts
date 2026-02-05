import 'server-only';

import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import type { OauthStatus } from './types';

/**
 * Gets OAuth status for a provider.
 *
 * @param provider - The OAuth provider to check status for
 */
export async function getOauthStatus(provider: OauthProviderKey): Promise<OauthStatus> {
  try {
    log.info('Getting OAuth status', { provider });
    const token = await db.Token.findOne({
      attributes: ['expiryAt', 'refreshToken'],
      where: { name: provider },
    });

    log.info('Got OAuth status', {
      expiresAt: token?.expiryAt?.toISOString(),
      hasRefreshToken: Boolean(token?.refreshToken),
      provider,
    });

    return {
      error: null,
      expiresAt: token?.expiryAt ?? null,
      isConnected: Boolean(token?.refreshToken),
    };
  } catch (error) {
    log.error('Failed to get OAuth status', {
      error: error instanceof Error ? error.message : String(error),
      provider,
    });
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch OAuth status',
      expiresAt: null,
      isConnected: false,
    };
  }
}
