import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Typography } from '@dg/ui/core/Typography';
import { truncated } from '@dg/ui/helpers/truncated';

export function ActivityName({ activity }: { activity: StravaActivity | null }) {
  if (!activity) {
    return null;
  }

  return (
    <Typography sx={truncated(2)} variant="h5">
      {activity.name}
    </Typography>
  );
}
