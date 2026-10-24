import 'server-only';

import type { WebhookSubscriptionMetadata } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { getWebhookSubscriptions } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { Skeleton } from '@dg/ui/core/Skeleton';
import { Typography } from '@dg/ui/core/Typography';
import { connection } from 'next/server';
import { Suspense } from 'react';
import {
  backfillStravaHistory,
  createWebhookSubscription,
  deleteWebhookSubscription,
} from '../../../services/strava.actions';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ServerActionButton } from '../ServerActionButton';
import { ErrorMessage, StatusChip } from '../StatusIndicators';

function SubscriptionDetails({ details }: { details: WebhookSubscriptionMetadata }) {
  return (
    <div className="devConsole__stack devConsole__stack--tight">
      <Typography color="var(--dg-palette-text-secondary)" variant="body2">
        <strong>Callback URL:</strong> {details.callbackUrl}
      </Typography>
      <Typography color="var(--dg-palette-text-secondary)" variant="body2">
        <strong>Created:</strong> <RelativeTime date={details.createdAt} />
      </Typography>
    </div>
  );
}

/**
 * Subscriptions we know about, plus the action that makes sense for them.
 */
function SubscriptionActions({
  subscriptions,
}: {
  subscriptions: Array<WebhookSubscriptionMetadata>;
}) {
  if (subscriptions.length === 0) {
    return (
      <ServerActionButton
        action={createWebhookSubscription}
        label="Create subscription"
        loadingLabel="Creating..."
      />
    );
  }

  return (
    <>
      <div className="devConsole__stack devConsole__stack--compact">
        {subscriptions.map((subscription) => (
          <SubscriptionDetails
            details={subscription}
            key={`${subscription.callbackUrl}-${subscription.createdAt}`}
          />
        ))}
      </div>
      <ServerActionButton
        action={deleteWebhookSubscription}
        label="Delete subscription"
        loadingLabel="Deleting..."
        tiltDeg={2}
        tone="vermilion"
      />
    </>
  );
}

/**
 * Fetches Strava webhook subscription status and renders a card with the
 * current state and available actions. Use with Suspense and
 * WebhookCardContentSkeleton for streaming.
 *
 * When Strava refuses the listing the card says so and offers no actions,
 * since creating or deleting would be guessing at state we don't have.
 */
export async function WebhookCardContent() {
  await connection();
  const { subscriptions, error } = await getWebhookSubscriptions();

  return (
    <>
      <div className="devConsole__row">
        <Typography variant="h3">Strava webhooks</Typography>
        <StatusChip isConnected={subscriptions.length > 0} />
      </div>
      <ErrorMessage message={error} />
      {error ? null : <SubscriptionActions subscriptions={subscriptions} />}
    </>
  );
}

/**
 * Loading skeleton shown while WebhookCard fetches data. Matches the layout
 * of the actual card to prevent layout shift.
 */
function WebhookCardContentSkeleton() {
  return (
    <>
      <div className="devConsole__row devConsole__row--wide">
        <Skeleton height={36} variant="text" width={240} />
        <Skeleton height={24} variant="rounded" width={120} />
      </div>
      <div className="devConsole__stack">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
      <Skeleton className="devConsole__skeletonButton" height={42} variant="rounded" width={260} />
    </>
  );
}

export function WebhookCard() {
  return (
    <DevConsoleCardShell>
      <Suspense fallback={<WebhookCardContentSkeleton />}>
        <WebhookCardContent />
      </Suspense>
      <ServerActionButton
        action={backfillStravaHistory}
        label="Backfill history"
        loadingLabel="Backfilling..."
        tiltDeg={1.5}
        tone="cream"
      />
    </DevConsoleCardShell>
  );
}
