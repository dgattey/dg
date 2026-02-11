import type { WebhookSubscriptionMetadata } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { Stack, Typography } from '@mui/material';

export function SubscriptionDetails({ details }: { details: WebhookSubscriptionMetadata }) {
  return (
    <Stack gap={0.5}>
      <Typography color="text.secondary" variant="body2">
        <strong>Callback URL:</strong> {details.callbackUrl}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        <strong>Created:</strong> <RelativeTime date={details.createdAt} />
      </Typography>
    </Stack>
  );
}
