'use client';

import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { useRouter } from 'next/navigation';
import { forceRefreshToken } from '../../../services/oauth.actions';
import { ServerActionButton } from '../ServerActionButton';

type ForceRefreshButtonProps = {
  /** Whether the provider currently has valid OAuth credentials */
  isConnected: boolean;
  /** Which OAuth provider these actions apply to */
  provider: OauthProviderKey;
};

/**
 * Client component that renders a button to force-refresh an OAuth token.
 * Only renders when the provider is connected.
 */
export function ForceRefreshButton({ isConnected, provider }: ForceRefreshButtonProps) {
  const router = useRouter();

  if (!isConnected) {
    return null;
  }

  return (
    <ServerActionButton
      action={() => forceRefreshToken(provider)}
      label="Force refresh token"
      loadingLabel="Refreshing..."
      onSuccess={() => router.refresh()}
      variant="outlined"
    />
  );
}
