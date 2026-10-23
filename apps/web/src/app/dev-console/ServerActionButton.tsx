'use client';

import { Stack } from '@dg/ui/core/Stack';
import { Typography } from '@dg/ui/core/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PaperButton } from '../collage/PaperButton';
import type { PaperTone } from '../collage/types';
import { ErrorMessage } from './StatusIndicators';

type ServerActionButtonProps = {
  action: () => Promise<{ success: boolean; error?: string; message?: string }>;
  label: string;
  loadingLabel: string;
  refreshOnSuccess?: boolean;
  tiltDeg?: number;
  tone?: PaperTone;
};

/**
 * Shared client component for dev console buttons that call server actions.
 * Handles loading state, error/message display, and optional router refresh.
 */
export function ServerActionButton({
  action,
  label,
  loadingLabel,
  refreshOnSuccess = false,
  tiltDeg = -2,
  tone = 'ochre',
}: ServerActionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await action();
      if (!result.success) {
        throw new Error(result.error ?? `Failed to ${label.toLowerCase()}`);
      }
      setMessage(result.message ?? null);
      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : `Failed to ${label.toLowerCase()}`;
      setError(errMessage);
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
      {message ? <Typography variant="body2">{message}</Typography> : null}
    </Stack>
  );
}
