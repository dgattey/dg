import 'server-only';

import type { OauthProvider, OauthStatus } from '@dg/services/oauth/types';
import { Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import { connection } from 'next/server';
import { getOauthStatus } from '../../services/oauth';
import { ForceRefreshOauthButton } from './ForceRefreshOauthButton';
import { ErrorMessage, StatusChip } from './StatusIndicators';

/** Props for the OauthCard async server component. */
type OauthCardProps = {
  provider: OauthProvider;
};

/** Props for the internal OauthCardDisplay presentational component. */
type OauthCardDisplayProps = {
  connectHref: string;
  provider: OauthProvider;
  status: OauthStatus;
};

/**
 * Builds the OAuth connect URL for a provider. Uses the OAuth route
 * which generates CSRF-protected state and PKCE parameters before redirecting.
 */
function getConnectHref(provider: OauthProvider): string {
  return `/api/oauth?provider=${provider}`;
}

/** Capitalizes the first letter of a provider name for display. */
function formatProviderName(provider: OauthProvider): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function TokenExpiry({ expiresAt }: { expiresAt: Date | null }) {
  if (!expiresAt) {
    return null;
  }
  return (
    <Typography color="text.secondary" variant="body2">
      Access token expires at {expiresAt.toLocaleString()}
    </Typography>
  );
}

/**
 * Displays OAuth connection status for a single provider. Shows the current
 * connection state, a connect button, force refresh action, and token expiry info.
 */
function OauthCardDisplay({ connectHref, provider, status }: OauthCardDisplayProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h6">{formatProviderName(provider)}</Typography>
            <StatusChip isConnected={status.isConnected} />
          </Stack>
          <ErrorMessage message={status.error} />
          <Button href={connectHref} size="small" variant="contained">
            {status.isConnected ? 'Reconnect' : 'Connect'}
          </Button>
          <ForceRefreshOauthButton isConnected={status.isConnected} provider={provider} />
          <TokenExpiry expiresAt={status.expiresAt} />
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton shown while OauthCard fetches data. Matches the layout
 * of the actual card to prevent layout shift.
 */
export function OauthCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Skeleton height={28} variant="text" width={80} />
            <Skeleton height={24} variant="rounded" width={100} />
          </Stack>
          <Skeleton height={30} variant="rounded" width={90} />
          <Skeleton height={20} variant="text" width="60%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Fetches OAuth connection status for a provider and renders a card with
 * the current state and available actions. Use with Suspense and
 * OauthCardSkeleton for streaming.
 */
export async function OauthCard({ provider }: OauthCardProps) {
  await connection();
  const status = await getOauthStatus(provider);
  const connectHref = getConnectHref(provider);

  return <OauthCardDisplay connectHref={connectHref} provider={provider} status={status} />;
}
