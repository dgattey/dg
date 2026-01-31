import { formattedDistance } from '@dg/shared-core/helpers/formattedDistance';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { Stack, Typography } from '@mui/material';
import type { StravaActivity } from './types';

const layoutSx: SxObject = {
  gap: 1,
  justifyContent: 'space-between',
};

const iconStackSx: SxObject = {
  alignItems: 'center',
  gap: 1,
};

/**
 * Shows a horizontal stack of stats for the latest strava activity
 */
export function ActivityStats({ activity }: { activity: StravaActivity | null }) {
  if (!activity?.distance) {
    return null;
  }

  const distance = formattedDistance({ distanceInMeters: activity.distance });
  const formattedDate = activity.relativeStartDate;

  return (
    <Stack direction="row" sx={layoutSx}>
      <Stack direction="row" sx={iconStackSx}>
        <FaIcon icon={faStrava} />
        <Typography variant="caption">{distance}</Typography>
      </Stack>
      {formattedDate ? <Typography variant="caption">{formattedDate}</Typography> : null}
    </Stack>
  );
}
