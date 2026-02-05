'use server';

import { forceRefreshToken as forceRefreshTokenImpl } from '@dg/services/oauth/forceRefreshToken';
import type { ForceRefreshResult } from '@dg/services/oauth/types';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { withDevConsoleAuth } from './devConsoleAuth';

/**
 * Server Action to force refresh an OAuth token.
 * Requires dev console authentication.
 */
// biome-ignore lint/suspicious/useAwait: Server actions must be async
export async function forceRefreshToken(provider: OauthProviderKey): Promise<ForceRefreshResult> {
  return withDevConsoleAuth(() => forceRefreshTokenImpl(provider));
}
