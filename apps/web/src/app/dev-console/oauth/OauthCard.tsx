import 'server-only';

import { getOauthStatus } from '@dg/services/oauth/getOauthStatus';
import { capitalize } from '@dg/shared-core/formatting/capitalize';
import type { OauthProviderKey } from '@dg/shared-core/routes/api';
import { oauthConnectRoute } from '@dg/shared-core/routes/api';
import { Skeleton } from '@dg/ui/core/Skeleton';
import { Typography } from '@dg/ui/core/Typography';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { forceRefreshToken } from '../../../services/oauth.actions';
import { PaperButton } from '../../collage/PaperButton';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ServerActionButton } from '../ServerActionButton';
import { ErrorMessage, StatusChip } from '../StatusIndicators';

type OauthCardProps = {
  provider: OauthProviderKey;
};

/**
 * Displays OAuth connection status for a single provider. Shows the current
 * connection state, a connect button, force refresh action, and token expiry info.
 */
export async function OauthCardContent({ provider }: OauthCardProps) {
  await connection();
  const status = await getOauthStatus(provider);
  const connectLabel = status.isConnected ? 'Reconnect' : 'Connect';

  return (
    <>
      <div className="devConsole__row devConsole__row--wide">
        <Typography as="h3" variant="title-md">
          {capitalize(provider)}
        </Typography>
        <StatusChip isConnected={status.isConnected} />
      </div>
      <ErrorMessage message={status.error} />
      <div className="devConsole__actions">
        <PaperButton
          href={oauthConnectRoute(provider)}
          tiltDeg={-2}
          title={connectLabel}
          tone="ochre"
        >
          {connectLabel}
        </PaperButton>
        {status.isConnected ? (
          <ServerActionButton
            action={forceRefreshToken.bind(null, provider)}
            label="Force refresh token"
            loadingLabel="Refreshing..."
            refreshOnSuccess
            tiltDeg={2}
            tone="cream"
          />
        ) : null}
      </div>
      {status.expiresAt ? (
        <Typography color="var(--dg-palette-text-secondary)" variant="meta">
          Access token expires at {status.expiresAt.toLocaleString()}
        </Typography>
      ) : null}
    </>
  );
}

/**
 * Loading skeleton shown while OauthCard fetches data. Matches the layout
 * of the actual card to prevent layout shift.
 */
function OauthCardContentSkeleton() {
  return (
    <>
      <div className="devConsole__row">
        <Skeleton height={36} variant="text" width={100} />
        <Skeleton height={24} variant="rounded" width={120} />
      </div>
      <div className="devConsole__actions">
        <Skeleton height={42} variant="rounded" width="100%" />
        <Skeleton height={42} variant="rounded" width="100%" />
      </div>
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
