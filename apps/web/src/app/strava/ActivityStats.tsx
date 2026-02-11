import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { Stack, Typography } from '@mui/material';

const layoutSx: SxObject = {
  gap: 1,
  justifyContent: 'space-between',
};

const iconStackSx: SxObject = {
  alignItems: 'center',
  gap: 1,
};

const dateOnlySx: SxObject = {
  marginLeft: 'auto',
};

/**
 * Shows a horizontal stack of stats for the latest strava activity
 */
export function ActivityStats({ activity }: { activity: StravaActivity | null }) {
  const hasDistance = activity?.distance !== null && activity?.distance !== undefined;
  const distance = hasDistance ? formattedDistance({ distanceInMeters: activity.distance }) : null;
  const startDate = activity?.startDate;
  if (!distance && !startDate) {
    return null;
  }

  return (
    <Stack direction="row" sx={layoutSx}>
      {distance ? (
        <Stack direction="row" sx={iconStackSx}>
          <FaIcon icon={faStrava} />
          <Typography variant="caption">{distance}</Typography>
        </Stack>
      ) : null}
      {startDate ? (
        <Typography sx={distance ? undefined : dateOnlySx} variant="caption">
          <RelativeTime date={startDate} />
        </Typography>
      ) : null}
    </Stack>
  );
}
