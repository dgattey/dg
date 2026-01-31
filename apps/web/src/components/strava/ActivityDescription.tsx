import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { StravaActivity } from './types';

/**
 * Formatted link for the activity description
 */
export function ActivityDescription({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.description || !activity.url) {
    return null;
  }
  const { url } = activity;

  return (
    <Link href={url} isExternal={true} sx={truncated(3)} title={activity.name} variant="body2">
      {activity.description}
    </Link>
  );
}
