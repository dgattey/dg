import 'server-only';

import type { WebhookSubscriptionMetadata } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { getWebhookSubscriptions } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { Skeleton, Stack, Typography } from '@mui/material';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ErrorMessage, StatusChip } from '../StatusIndicators';
import { CreateWebhookButton } from './CreateWebhookButton';
import { DeleteWebhookButton } from './DeleteWebhookButton';
import { SubscriptionDetails } from './SubscriptionDetails';

/**
 * Subscriptions we know about, plus the action that makes sense for them.
 */
function SubscriptionActions({
  subscriptions,
}: {
  subscriptions: Array<WebhookSubscriptionMetadata>;
}) {
  if (subscriptions.length === 0) {
    return <CreateWebhookButton />;
  }

  return (
    <>
      <Stack
        sx={{
          gap: 1,
        }}
      >
        {subscriptions.map((subscription) => (
          <SubscriptionDetails
            details={subscription}
            key={`${subscription.callbackUrl}-${subscription.createdAt}`}
          />
        ))}
      </Stack>
      <DeleteWebhookButton />
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
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="h3">Strava webhooks</Typography>
        <StatusChip isConnected={subscriptions.length > 0} />
      </Stack>
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
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Skeleton height={36} variant="text" width={240} />
        <Skeleton height={24} variant="rounded" width={120} />
      </Stack>
      <Stack>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Stack>
      <Skeleton height={42} sx={{ alignSelf: 'flex-start' }} variant="rounded" width={260} />
    </>
  );
}

export function WebhookCard() {
  return (
    <DevConsoleCardShell>
      <Suspense fallback={<WebhookCardContentSkeleton />}>
        <WebhookCardContent />
      </Suspense>
    </DevConsoleCardShell>
  );
}
