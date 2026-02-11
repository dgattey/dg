import 'server-only';

import { MissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { log } from '@dg/shared-core/logging/log';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import type { RefreshTokenConfig } from '../clients/RefreshTokenConfig';
import { forceRefreshTokenData } from '../clients/refreshedAccessToken';
import { getSpotifyRefreshTokenConfig } from '../spotify/spotifyClient';
import { getStravaRefreshTokenConfig } from '../strava/stravaClient';
import type { ForceRefreshResult } from './types';

const getRefreshConfig = (provider: OauthProviderKey): RefreshTokenConfig => {
  switch (provider) {
    case 'strava':
      return getStravaRefreshTokenConfig();
    case 'spotify':
      return getSpotifyRefreshTokenConfig();
  }

  const exhaustiveCheck: never = provider;
  throw new Error(`Unsupported OAuth provider: ${exhaustiveCheck}`);
};

/**
 * Forces a refresh of the OAuth token for the given provider.
 *
 * @param provider - The OAuth provider to refresh token for
 */
export async function forceRefreshToken(provider: OauthProviderKey): Promise<ForceRefreshResult> {
  try {
    const config = getRefreshConfig(provider);
    const refreshed = await forceRefreshTokenData(provider, config);

    log.info('Force refreshed token', {
      expiresAt: refreshed.expiryAt.toISOString(),
      provider,
    });

    return { expiresAt: refreshed.expiryAt, success: true };
  } catch (error) {
    if (error instanceof MissingTokenError) {
      return {
        error: 'No refresh token found. Please re-authenticate.',
        success: false,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error force refreshing token', { error: message, provider });
    return { error: message, success: false };
  }
}
