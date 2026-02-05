'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { createWebhookSubscription } from '../../services/strava.actions';

/**
 * Client component that renders a button to create a Strava webhook subscription.
 */
export function CreateWebhookButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createWebhookSubscription();
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create subscription');
      }
      // Server action handles revalidation
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={1}>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button
        disabled={isLoading}
        onClick={handleClick}
        size="medium"
        sx={{ alignSelf: 'flex-start' }}
        variant="contained"
      >
        {isLoading ? 'Creating...' : 'Create subscription'}
      </Button>
    </Stack>
  );
}
