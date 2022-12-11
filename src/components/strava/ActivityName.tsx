import { useData } from 'api/useData';
import { SxProps, Theme } from '@mui/material';
import { truncated } from 'helpers/truncated';
import { Link } from 'components/Link';
import { mixinSx } from 'ui/helpers/mixinSx';

/**
 * Formatted link for the activity name
 */
export function ActivityName({ url, sx }: { url: string; sx?: SxProps<Theme> }) {
  const { data: activity } = useData('latest/activity');
  if (!activity?.name) {
    return null;
  }

  return (
    <Link
      isExternal
      href={url}
      title={activity.name}
      sx={mixinSx(sx, truncated(2))}
      linkProps={{ variant: 'h5', color: 'h5' }}
    >
      {activity.name}
    </Link>
  );
}
