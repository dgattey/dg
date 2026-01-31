import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import type { StravaActivity } from './types';

/**
 * Formatted link for the activity name
 */
export function ActivityName({ activity, sx }: { activity: StravaActivity | null; sx?: SxObject }) {
  if (!activity?.name || !activity.url) {
    return null;
  }
  const { url } = activity;

  const mergedSx = sx ? { ...truncated(2), ...sx } : truncated(2);

  return (
    <Link href={url} isExternal={true} sx={mergedSx} title={activity.name} variant="h5">
      {activity.name}
    </Link>
  );
}
