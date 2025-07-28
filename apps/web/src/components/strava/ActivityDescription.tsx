import { useData } from 'api/useData';
import { Link } from 'ui/dependent/Link';
import { truncated } from 'ui/helpers/truncated';

/**
 * Formatted link for the activity description
 */
export function ActivityDescription({ url }: { url: string }) {
  const { data: activity } = useData('latest/activity');
  if (!activity?.description) {
    return null;
  }

  return (
    <Link
      href={url}
      isExternal
      linkProps={{ variant: 'body2', color: 'body2' }}
      sx={truncated(3)}
      title={activity.name}
    >
      {activity.description}
    </Link>
  );
}
