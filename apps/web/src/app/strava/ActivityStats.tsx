import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { formattedDistance } from '@dg/shared-core/formatting/formattedDistance';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { Box, Stack, Typography } from '@mui/material';
import { formatMovingTime } from './formatMovingTime';

const layoutSx: SxObject = {
  gap: 1,
  justifyContent: 'space-between',
};

const iconStackSx: SxObject = {
  '[data-greenhouse-frame] &': {
    alignItems: 'center',
    columnGap: 1,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto auto',
    rowGap: 0,
  },
  alignItems: 'center',
  gap: 1,
};

const iconSx: SxObject = {
  '[data-greenhouse-frame] &': {
    alignItems: 'center',
    backgroundColor: 'var(--route-line, hsl(24deg, 100%, 52%))',
    borderRadius: '50%',
    color: '#fff',
    display: 'inline-flex',
    gridRow: '1 / 3',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  display: 'contents',
};

const distanceSx: SxObject = {
  '[data-greenhouse-frame] &': {
    fontSize: '0.92rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
};

const movingSx: SxObject = {
  '[data-greenhouse-frame] &': {
    color: 'var(--mui-palette-text-secondary)',
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  display: 'none',
};

const dateOnlySx: SxObject = {
  marginLeft: 'auto',
};

const whenSx: SxObject = {
  '[data-greenhouse-frame] &': {
    display: 'none',
  },
};

/**
 * Shows a horizontal stack of stats for the latest strava activity
 */
export function ActivityStats({ activity }: { activity: StravaActivity | null }) {
  const hasDistance = activity?.distance !== null && activity?.distance !== undefined;
  const distance = hasDistance ? formattedDistance({ distanceInMeters: activity.distance }) : null;
  const movingTime = formatMovingTime(activity?.movingTime);
  const startDate = activity?.startDate;
  if (!distance && !startDate) {
    return null;
  }

  return (
    <Stack data-activity-stats="" direction="row" sx={layoutSx}>
      {distance ? (
        <Stack data-activity-icon-stack="" direction="row" sx={iconStackSx}>
          <Box data-activity-icon="" sx={iconSx}>
            <FaIcon icon={faStrava} />
          </Box>
          <Typography data-activity-distance="" sx={distanceSx} variant="caption">
            {distance}
          </Typography>
          {movingTime ? (
            <Typography data-activity-moving="" sx={movingSx} variant="caption">
              {movingTime}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
      {startDate ? (
        <Typography
          data-activity-when=""
          sx={distance ? whenSx : { ...dateOnlySx, ...whenSx }}
          variant="caption"
        >
          <RelativeTime date={startDate} />
        </Typography>
      ) : null}
    </Stack>
  );
}
