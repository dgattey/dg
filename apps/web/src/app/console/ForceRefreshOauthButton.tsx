'use client';

import type { OauthProvider } from '@dg/services/oauth/types';
import { Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { forceRefreshToken } from '../../services/oauth.actions';

type ForceRefreshOauthButtonProps = {
  /** Whether the provider currently has valid OAuth credentials */
  isConnected: boolean;
  /** Which OAuth provider these actions apply to (e.g., 'spotify', 'strava') */
  provider: OauthProvider;
};

/**
 * Client component that renders a button to force-refresh an OAuth token.
 * Only renders when the provider is connected.
 */
export function ForceRefreshOauthButton({ isConnected, provider }: ForceRefreshOauthButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Forces a token refresh via server action, then refreshes the page
   * to display the updated token status.
   */
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await forceRefreshToken(provider);
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to refresh token');
      }
      // Refresh the page to show updated token status
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh token';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if not connected - no token to refresh
  if (!isConnected) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button disabled={isLoading} onClick={handleRefresh} size="small" variant="outlined">
        {isLoading ? 'Refreshing...' : 'Force refresh token'}
      </Button>
    </Stack>
  );
}
