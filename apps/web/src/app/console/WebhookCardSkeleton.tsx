import { Card, CardContent, Skeleton, Stack } from '@mui/material';

/**
 * Loading skeleton shown while WebhookCard fetches data. Matches the layout
 * of the actual card to prevent layout shift.
 */
export function WebhookCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Skeleton height={28} variant="text" width={120} />
            <Skeleton height={24} variant="rounded" width={100} />
          </Stack>
          <Skeleton height={20} variant="text" width="80%" />
          <Skeleton height={20} variant="text" width="70%" />
          <Skeleton height={36} variant="rounded" width={150} />
        </Stack>
      </CardContent>
    </Card>
  );
}
