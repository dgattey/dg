import { useData } from 'api/useData';
import { FaIcon } from 'components/FaIcon';
import { HorizontalStack } from 'ui/HorizontalStack';
import { faBicycle } from '@fortawesome/free-solid-svg-icons/faBicycle';
import { faRunning } from '@fortawesome/free-solid-svg-icons/faRunning';
import { Typography } from '@mui/material';

/**
 * Shows the latest activity type and an icon to depict
 * what type of activity it is.
 */
export function ActivityTypeWithIcon() {
  const { data: activity } = useData('latest/activity');
  if (!activity?.type) {
    return null;
  }

  // Split on capital letters to split an enum-like value
  const typeText = activity.type.includes('Ride')
    ? activity.type.replace(/([A-Z][a-z]+)/g, ' $1')
    : 'Run';
  const icon = (
    <FaIcon size="1.25em" icon={activity.type.includes('Ride') ? faBicycle : faRunning} />
  );

  return (
    <Typography
      variant="overline"
      component={HorizontalStack}
      sx={{
        gap: 1,
        alignItems: 'center',
      }}
    >
      <>Latest {typeText.trim()}</> {icon}
    </Typography>
  );
}
