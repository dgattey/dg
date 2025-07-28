import { Typography } from '@mui/material';
import { useData } from 'api/useData';
import { Bike, Dumbbell } from 'lucide-react';
import { HorizontalStack } from 'ui/core/HorizontalStack';

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
    ? activity.type.replace(/(?<rideType>[A-Z][a-z]+)/g, ' $1')
    : 'Run';
  const icon = activity.type.includes('Ride') ? <Bike size="1.25em" /> : <Dumbbell size="1.25em" />;

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
