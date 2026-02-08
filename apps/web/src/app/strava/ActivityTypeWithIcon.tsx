import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { Bike, Dumbbell } from 'lucide-react';

const activityTypeSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  gap: 1,
};

/**
 * Shows the latest activity type and an icon to depict
 * what type of activity it is.
 */
export function ActivityTypeWithIcon({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.type) {
    return null;
  }

  // Split on capital letters to split an enum-like value
  const typeText = activity.type.includes('Ride')
    ? activity.type.replace(/(?<rideType>[A-Z][a-z]+)/g, ' $1')
    : 'Run';
  const icon = activity.type.includes('Ride') ? <Bike size="1.25em" /> : <Dumbbell size="1.25em" />;

  return (
    <Typography component="div" sx={activityTypeSx} variant="overline">
      Latest {typeText.trim()} {icon}
    </Typography>
  );
}
