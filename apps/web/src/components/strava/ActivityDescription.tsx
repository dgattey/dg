import { useData } from 'api/useData';
import { truncated } from 'helpers/truncated';
import { Link } from 'components/Link';

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
      isExternal
      href={url}
      title={activity.name}
      sx={truncated(3)}
      linkProps={{ variant: 'body2', color: 'body2' }}
    >
      {activity.description}
    </Link>
  );
}
