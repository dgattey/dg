import 'server-only';

import { getOauthStatus } from '@dg/services/oauth/getOauthStatus';
import { capitalize } from '@dg/shared-core/formatting/capitalize';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { Skeleton, Stack, Typography } from '@mui/material';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ErrorMessage } from '../ErrorMessage';
import { StatusChip } from '../StatusChip';
import { ConnectButton } from './ConnectButton';
import { ForceRefreshButton } from './ForceRefreshButton';
import { TokenExpiry } from './TokenExpiry';

/** Props for the OauthCard async server component. */
type OauthCardProps = {
  provider: OauthProviderKey;
};

/**
 * Displays OAuth connection status for a single provider. Shows the current
 * connection state, a connect button, force refresh action, and token expiry info.
 */
async function OauthCardContent({ provider }: OauthCardProps) {
  await connection();
  const status = await getOauthStatus(provider);

  return (
    <>
      <Stack alignItems="center" direction="row" gap={1.5}>
        <Typography variant="h3">{capitalize(provider)}</Typography>
        <StatusChip isConnected={status.isConnected} />
      </Stack>
      <ErrorMessage message={status.error} />
      <ButtonGrid>
        <ConnectButton provider={provider} status={status} />
        <ForceRefreshButton isConnected={status.isConnected} provider={provider} />
      </ButtonGrid>
      <TokenExpiry expiresAt={status.expiresAt} />
    </>
  );
}

function ButtonGrid({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      }}
    >
      {children}
    </Stack>
  );
}

/**
 * Loading skeleton shown while OauthCard fetches data. Matches the layout
 * of the actual card to prevent layout shift.
 */
function OauthCardContentSkeleton() {
  return (
    <>
      <Stack alignItems="center" direction="row" gap={1}>
        <Skeleton height={36} variant="text" width={100} />
        <Skeleton height={24} variant="rounded" width={120} />
      </Stack>
      <ButtonGrid>
        <Skeleton height={42} variant="rounded" width="100%" />
        <Skeleton height={42} variant="rounded" width="100%" />
      </ButtonGrid>
      <Skeleton variant="text" width="80%" />
    </>
  );
}

/**
 * Fetches OAuth connection status for a provider and renders a card with
 * the current state and available actions. Use with Suspense and
 * OauthCardContentSkeleton for streaming.
 */
export function OauthCard({ provider }: OauthCardProps) {
  return (
    <DevConsoleCardShell>
      <Suspense fallback={<OauthCardContentSkeleton />}>
        <OauthCardContent provider={provider} />
      </Suspense>
    </DevConsoleCardShell>
  );
}
