import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { Typography } from '@dg/ui/core/Typography';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';

/**
 * Formatted link for the activity description, or plain text when an enclosing
 * element already links to the activity.
 */
export function ActivityDescription({
  activity,
  isLinked = true,
}: {
  activity: StravaActivity | null;
  isLinked?: boolean;
}) {
  if (!activity?.description) {
    return null;
  }

  if (!isLinked) {
    return (
      <Typography sx={truncated(3)} variant="body2">
        {activity.description}
      </Typography>
    );
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
