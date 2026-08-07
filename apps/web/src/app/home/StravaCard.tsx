import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { StravaRouteMap } from '@dg/maps/StravaRouteMap';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';

const cardSx: SxObject = {
  padding: 0,
};

const layoutStackSx: SxObject = {
  gap: 2,
  height: '100%',
  justifyContent: 'space-between',
  padding: 2.5,
  position: 'relative',
  textShadow:
    '0 0 3px var(--mui-palette-background-paper), 0 0 7px var(--mui-palette-background-paper)',
  zIndex: 3,
};

const activityNameSx: SxObject = {
  marginBottom: 1,
};

const mapSx: SxObject = {
  inset: 0,
  position: 'absolute',
};

const scrimSx: SxObject = {
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--mui-palette-background-paper) 68%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 86%, transparent))',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 1,
};

/**
 * Shows a card with the latest activity from Strava
 */
export function StravaCard({ activity }: { activity: StravaActivity | null }) {
  if (!activity) {
    return null;
  }

  const encodedPolyline = activity.map?.summaryPolyline ?? activity.map?.polyline;

  return (
    <ContentCard sx={cardSx}>
      {encodedPolyline ? (
        <>
          <Box sx={mapSx}>
            <StravaRouteMap encodedPolyline={encodedPolyline} />
          </Box>
          <Box aria-hidden="true" sx={scrimSx} />
        </>
      ) : null}
      <Stack sx={layoutStackSx}>
        <ActivityStats activity={activity} />
        <Stack>
          <ActivityTypeWithIcon activity={activity} />
          <ActivityName activity={activity} sx={activityNameSx} />
          <ActivityDescription activity={activity} />
        </Stack>
      </Stack>
    </ContentCard>
  );
}
