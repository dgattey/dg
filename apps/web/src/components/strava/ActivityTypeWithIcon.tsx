import { faBicycle } from '@fortawesome/free-solid-svg-icons/faBicycle';
import { faRunning } from '@fortawesome/free-solid-svg-icons/faRunning';
import { Typography } from '@mui/material';
import { useData } from 'api/useData';
import { FaIcon } from 'components/FaIcon';
import { HorizontalStack } from 'ui/HorizontalStack';

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
    ? activity.type.replace(/(?:[A-Z][a-z]+)/g, ' $1')
    : 'Run';
  const icon = (
    <FaIcon icon={activity.type.includes('Ride') ? faBicycle : faRunning} size="1.25em" />
  );

  return (
    <Typography
      component={HorizontalStack}
      sx={{
        gap: 1,
        alignItems: 'center',
      }}
      variant="overline"
    >
      <>Latest {typeText.trim()}</> {icon}
    </Typography>
  );
}
