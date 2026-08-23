import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

/**
 * Formatted link for the activity name
 */
export function ActivityName({
  activity,
  sx,
  typeScale = 'default',
}: {
  activity: StravaActivity | null;
  sx?: SxObject;
  typeScale?: 'default' | 'greenhouse';
}) {
  if (!activity) {
    return null;
  }
  const mergedSx = sx ? { ...truncated(2), ...sx } : truncated(2);

  return (
    <Link
      href={activity.url}
      isExternal={true}
      sx={mergedSx}
      title={activity.name}
      variant={typeScale === 'greenhouse' ? 'h3' : 'h5'}
    >
      {activity.name}
    </Link>
  );
}
