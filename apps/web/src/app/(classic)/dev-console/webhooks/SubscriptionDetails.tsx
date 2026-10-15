import type { WebhookSubscriptionMetadata } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { Stack } from '@dg/ui/core/Stack';
import { Typography } from '@dg/ui/core/Typography';

export function SubscriptionDetails({ details }: { details: WebhookSubscriptionMetadata }) {
  return (
    <Stack
      sx={{
        gap: 0.5,
      }}
    >
      <Typography
        sx={{
          color: 'text.secondary',
        }}
        variant="body2"
      >
        <strong>Callback URL:</strong> {details.callbackUrl}
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
        }}
        variant="body2"
      >
        <strong>Created:</strong> <RelativeTime date={details.createdAt} />
      </Typography>
    </Stack>
  );
}
