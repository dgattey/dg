import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';

/**
 * Formatted link for the activity description
 */
export function ActivityDescription({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.description) {
    return null;
  }

  return (
    <Link
      href={activity.url}
      isExternal={true}
      sx={truncated(3)}
      title={activity.name}
      variant="body2"
    >
      {activity.description}
    </Link>
  );
}
