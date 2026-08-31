'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { ButtonProps } from '@mui/material';
import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import { PaperButton } from '../../collage/PaperButton';
import styles from './devConsole.module.css';
import { ErrorMessage } from './StatusIndicators';

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
  /** Visual surface for the action */
  surface?: SiteSurface;
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
  surface = 'classic',
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
    <Stack
      sx={{
        gap: 1,
      }}
    >
      <ErrorMessage message={error} surface={surface} />
      {surface === 'collage' ? (
        <PaperButton
          className={styles.actionButton}
          disabled={isLoading}
          onClick={handleClick}
          tiltDeg={variant === 'outlined' ? 2 : -2}
          tone={color === 'error' ? 'vermilion' : variant === 'outlined' ? 'cream' : 'ochre'}
        >
          {isLoading ? loadingLabel : label}
        </PaperButton>
      ) : (
        <Button
          color={color}
          disabled={isLoading}
          onClick={handleClick}
          size="small"
          variant={variant}
        >
          {isLoading ? loadingLabel : label}
        </Button>
      )}
    </Stack>
  );
}
