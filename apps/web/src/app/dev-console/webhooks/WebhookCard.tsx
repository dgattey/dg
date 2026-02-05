import 'server-only';

import { getWebhookSubscriptions } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { Skeleton, Stack, Typography } from '@mui/material';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { StatusChip } from '../StatusChip';
import { CreateWebhookButton } from './CreateWebhookButton';
import { DeleteWebhookButton } from './DeleteWebhookButton';
import { SubscriptionDetails } from './SubscriptionDetails';

/**
 * Fetches Strava webhook subscription status and renders a card with the
 * current state and available actions. Use with Suspense and
 * WebhookCardContentSkeleton for streaming.
 */
async function WebhookCardContent() {
  await connection();
  const subscriptions = await getWebhookSubscriptions();
  const hasSubscription = subscriptions.length > 0;

  return (
    <>
      <Stack alignItems="center" direction="row" gap={1}>
        <Typography variant="h3">Strava webhooks</Typography>
        <StatusChip isConnected={hasSubscription} />
      </Stack>
      {hasSubscription ? (
        <>
          <Stack gap={1}>
            {subscriptions.map((subscription) => (
              <SubscriptionDetails
                details={subscription}
                key={`${subscription.callbackUrl}-${subscription.createdAt}`}
              />
            ))}
          </Stack>
          <DeleteWebhookButton />
        </>
      ) : (
        <CreateWebhookButton />
      )}
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
      <Stack alignItems="center" direction="row" gap={1.5}>
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
