'use client';

import { Stack } from '@dg/ui/core/Stack';
import { Typography } from '@dg/ui/core/Typography';
import { useState } from 'react';
import { backfillStravaHistory } from '../../../services/strava.actions';
import { ServerActionButton } from '../ServerActionButton';

/**
 * Client component that backfills stored Strava history and shows how the run went.
 */
export function BackfillHistoryButton() {
  const [message, setMessage] = useState<string | null>(null);

  const backfill = async () => {
    setMessage(null);
    const result = await backfillStravaHistory();
    setMessage(result.message ?? null);
    return result;
  };

  return (
    <Stack sx={{ gap: 1 }}>
      <ServerActionButton
        action={backfill}
        label="Backfill history"
        loadingLabel="Backfilling..."
        tiltDeg={1.5}
        tone="cream"
      />
      {message ? <Typography variant="body2">{message}</Typography> : null}
    </Stack>
  );
}
