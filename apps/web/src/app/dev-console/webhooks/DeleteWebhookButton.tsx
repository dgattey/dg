'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { deleteWebhookSubscription } from '../../../services/strava.actions';

/**
 * Client component that renders a button to delete a Strava webhook subscription.
 * The subscription ID is looked up server-side for security.
 */
export function DeleteWebhookButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteWebhookSubscription();
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to delete subscription');
      }
      // Server action handles revalidation
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete subscription';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap={1}>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button
        color="error"
        disabled={isLoading}
        onClick={handleClick}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
        variant="outlined"
      >
        {isLoading ? 'Deleting...' : 'Delete subscription'}
      </Button>
    </Stack>
  );
}
