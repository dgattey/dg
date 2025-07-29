import { useData } from 'api/useData';
import { Link } from 'ui/dependent/Link';
import { mixinSx } from 'ui/helpers/mixinSx';
import { truncated } from 'ui/helpers/truncated';
import type { SxProps } from 'ui/theme';

/**
 * Formatted link for the activity name
 */
export function ActivityName({ url, sx }: { url: string; sx?: SxProps }) {
  const { data: activity } = useData('latest/activity');
  if (!activity?.name) {
    return null;
  }

  return (
    <Link
      href={url}
      isExternal={true}
      linkProps={{ color: 'h5', variant: 'h5' }}
      sx={mixinSx(sx, truncated(2))}
      title={activity.name}
    >
      {activity.name}
    </Link>
  );
}
