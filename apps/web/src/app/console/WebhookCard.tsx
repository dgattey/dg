import 'server-only';

import { Card, CardContent, Stack, Typography } from '@mui/material';
import { connection } from 'next/server';
import { getWebhookSubscriptions } from '../../services/strava';
import { CreateWebhookButton } from './CreateWebhookButton';
import { DeleteWebhookButton } from './DeleteWebhookButton';
import { ErrorMessage, StatusChip } from './StatusIndicators';

/** Subscription metadata (IDs are never exposed to frontend). */
type SubscriptionMetadata = {
  callbackUrl: string;
  createdAt: string;
};

/**
 * Fetches webhook subscription status from Strava. Returns the first
 * subscription found (Strava only allows one per app) or null if none exist.
 */
async function getStravaWebhookStatus(): Promise<{
  error: string | null;
  subscription: SubscriptionMetadata | null;
}> {
  try {
    const subscriptions = await getWebhookSubscriptions();
    const subscription = subscriptions[0] ?? null;
    return { error: null, subscription };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
    return { error: message, subscription: null };
  }
}

function SubscriptionDetails({ details }: { details: SubscriptionMetadata }) {
  return (
    <Stack spacing={0.5}>
      <Typography color="text.secondary" variant="body2">
        Callback URL: {details.callbackUrl}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Created: {new Date(details.createdAt).toLocaleString()}
      </Typography>
    </Stack>
  );
}

/**
 * Fetches Strava webhook subscription status and renders a card with the
 * current state and available actions. Use with Suspense and
 * WebhookCardSkeleton for streaming.
 */
export async function WebhookCard() {
  await connection();
  const { error, subscription } = await getStravaWebhookStatus();
  const hasSubscription = subscription !== null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h6">Strava webhooks</Typography>
            <StatusChip isConnected={hasSubscription} />
          </Stack>
          <ErrorMessage message={error} />
          {hasSubscription ? (
            <>
              {subscription && <SubscriptionDetails details={subscription} />}
              <DeleteWebhookButton />
            </>
          ) : (
            <CreateWebhookButton />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
