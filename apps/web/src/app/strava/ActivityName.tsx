import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

/**
 * Formatted link for the activity name
 */
export function ActivityName({ activity, sx }: { activity: StravaActivity | null; sx?: SxObject }) {
  if (!activity) {
    return null;
  }
  const mergedSx = sx ? { ...truncated(2), ...sx } : truncated(2);

  return (
    <Link href={activity.url} isExternal={true} sx={mergedSx} title={activity.name} variant="h5">
      {activity.name}
    </Link>
  );
}
