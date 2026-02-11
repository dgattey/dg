import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Activity, Bike, Dumbbell, Footprints, Mountain, MountainSnow } from 'lucide-react';

const activityTypeSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  gap: 1,
};

const TYPE_TO_ICON: Record<string, LucideIcon> = {
  AlpineSki: MountainSnow,
  BackcountrySki: MountainSnow,
  EBikeRide: Bike,
  Hike: Mountain,
  NordicSki: MountainSnow,
  Ride: Bike,
  Run: Footprints,
  Snowboard: MountainSnow,
  VirtualRide: Bike,
  VirtualRun: Footprints,
  Walk: Footprints,
  WeightTraining: Dumbbell,
  Workout: Dumbbell,
};

function getActivityTypeDisplay(type: string): { label: string; Icon: LucideIcon } {
  const label = type.replace(/([A-Z][a-z]+)/g, ' $1').trim();
  const Icon = TYPE_TO_ICON[type] ?? Activity;
  return { Icon, label };
}

/**
 * Shows the latest activity type and an icon to depict
 * what type of activity it is.
 */
export function ActivityTypeWithIcon({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.type) {
    return null;
  }

  const { label, Icon } = getActivityTypeDisplay(activity.type);

  return (
    <Typography component="div" sx={activityTypeSx} variant="overline">
      Latest {label} <Icon size="1.25em" />
    </Typography>
  );
}
