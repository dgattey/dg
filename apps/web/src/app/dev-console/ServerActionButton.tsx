'use client';

import type { ButtonProps } from '@mui/material';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

type ServerActionButtonProps = {
  /** The server action to call when clicked */
  action: () => Promise<{ success: boolean; error?: string }>;
  /** Button color */
  color?: ButtonProps['color'];
  /** Button label */
  label: string;
  /** Button label while loading */
  loadingLabel: string;
  /** Optional callback after successful action */
  onSuccess?: () => void;
  /** Button variant */
  variant?: ButtonProps['variant'];
};

/**
 * Shared client component for dev console buttons that call server actions.
 * Handles loading state, error display, and success callbacks.
 */
export function ServerActionButton({
  action,
  color,
  label,
  loadingLabel,
  onSuccess,
  variant = 'contained',
}: ServerActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await action();
      if (!result.success) {
        throw new Error(result.error ?? `Failed to ${label.toLowerCase()}`);
      }
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${label.toLowerCase()}`;
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
        color={color}
        disabled={isLoading}
        onClick={handleClick}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
        variant={variant}
      >
        {isLoading ? loadingLabel : label}
      </Button>
    </Stack>
  );
}
