'use client';

import { Stack } from '@dg/ui/core/Stack';
import { useState } from 'react';
import { PaperButton } from '../collage/PaperButton';
import type { PaperTone } from '../collage/types';
import { ErrorMessage } from './StatusIndicators';

type ServerActionButtonProps = {
  action: () => Promise<{ success: boolean; error?: string }>;
  label: string;
  loadingLabel: string;
  onSuccess?: () => void;
  tiltDeg?: number;
  tone?: PaperTone;
};

/**
 * Shared client component for dev console buttons that call server actions.
 * Handles loading state, error display, and success callbacks.
 */
export function ServerActionButton({
  action,
  label,
  loadingLabel,
  onSuccess,
  tiltDeg = -2,
  tone = 'ochre',
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
    <Stack sx={{ gap: 1 }}>
      <ErrorMessage message={error} />
      <PaperButton
        className="devConsole__actionButton"
        disabled={isLoading}
        onClick={handleClick}
        tiltDeg={tiltDeg}
        tone={tone}
      >
        {isLoading ? loadingLabel : label}
      </PaperButton>
    </Stack>
  );
}
