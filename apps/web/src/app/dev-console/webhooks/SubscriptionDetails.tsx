import type { WebhookSubscriptionMetadata } from '@dg/services/strava/webhooks/getWebhookSubscriptions';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { formatRelativeTime } from '@dg/ui/helpers/relativeTime';
import { Stack, Typography } from '@mui/material';

export function SubscriptionDetails({ details }: { details: WebhookSubscriptionMetadata }) {
  const createdAtLabel = new Date(details.createdAt).toLocaleString();
  const createdLabel = formatRelativeTime({
    fromDate: details.createdAt,
    toDate: Date.now(),
  });
  invariant(createdLabel, 'Missing created label');

  return (
    <Stack gap={0.5}>
      <Typography color="text.secondary" variant="body2">
        <strong>Callback URL:</strong> {details.callbackUrl}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        <strong>Created:</strong>{' '}
        <Tooltip placement="top" title={createdAtLabel}>
          <span>{createdLabel}</span>
        </Tooltip>
      </Typography>
    </Stack>
  );
}
