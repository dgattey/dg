import { truncated } from 'ui/helpers/truncated';
import { mixinSx } from 'ui/helpers/mixinSx';
import type { SxProps } from 'ui/theme';
import { Link } from 'ui/dependent/Link';
import { useData } from 'api/useData';

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
      isExternal
      linkProps={{ variant: 'h5', color: 'h5' }}
      sx={mixinSx(sx, truncated(2))}
      title={activity.name}
    >
      {activity.name}
    </Link>
  );
}
