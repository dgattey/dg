import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Typography } from '@dg/ui/core/Typography';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

/**
 * Formatted link for the activity name, or plain text when an enclosing
 * element already links to the activity.
 */
export function ActivityName({
  activity,
  isLinked = true,
  sx,
}: {
  activity: StravaActivity | null;
  isLinked?: boolean;
  sx?: SxObject;
}) {
  if (!activity) {
    return null;
  }
  const mergedSx = sx ? { ...truncated(2), ...sx } : truncated(2);

  if (!isLinked) {
    return (
      <Typography sx={mergedSx} variant="h5">
        {activity.name}
      </Typography>
    );
  }

  return (
    <Link href={activity.url} isExternal={true} sx={mergedSx} title={activity.name} variant="h5">
      {activity.name}
    </Link>
  );
}
