'use client';

import { Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type WebhookActionsProps = {
  hasSubscription: boolean;
  subscriptionId?: number;
};

export function WebhookActions({ hasSubscription, subscriptionId }: WebhookActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/webhooks/manage', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Failed to create subscription');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!subscriptionId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/webhooks/manage?id=${subscriptionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Failed to delete subscription');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subscription');
    } finally {
      setIsLoading(false);
    }
  }, [router, subscriptionId]);

  return (
    <Stack spacing={1}>
      {error && (
        <span style={{ color: 'var(--mui-palette-error-main)', fontSize: '0.875rem' }}>
          {error}
        </span>
      )}
      <Stack direction="row" spacing={1}>
        {!hasSubscription && (
          <Button disabled={isLoading} onClick={handleCreate} variant="contained">
            {isLoading ? 'Creating...' : 'Create Subscription'}
          </Button>
        )}
        {hasSubscription && subscriptionId && (
          <Button color="error" disabled={isLoading} onClick={handleDelete} variant="outlined">
            {isLoading ? 'Deleting...' : 'Delete Subscription'}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
