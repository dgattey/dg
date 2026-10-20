import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Typography } from '@dg/ui/core/Typography';
import { truncated } from '@dg/ui/helpers/truncated';

export function ActivityDescription({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.description) {
    return null;
  }

  return (
    <Typography sx={truncated(3)} variant="body2">
      {activity.description}
    </Typography>
  );
}
