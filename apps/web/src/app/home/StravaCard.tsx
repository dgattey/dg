import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { StravaRouteMap } from '@dg/maps/StravaRouteMap';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { ActivityDescription } from '../strava/ActivityDescription';
import { ActivityName } from '../strava/ActivityName';
import { ActivityStats } from '../strava/ActivityStats';
import { ActivityTypeWithIcon } from '../strava/ActivityTypeWithIcon';

const paperMix = (percent: number) =>
  `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

/**
 * Both schemes pull the map toward their own reading surface, but they cannot use
 * the same color to do it. Light mode's paper is near-white, so mixing toward it
 * keeps the route orange. Dark mode's paper is a saturated teal — orange's near
 * complement — and mixing toward that turns the route to mud, so dark mode
 * darkens with black instead, which holds the hue while deepening it.
 */
const scrimMix = (light: number, dark: number) =>
  `light-dark(${paperMix(light)}, rgb(0 0 0 / ${dark / 100}))`;

const cardSx: SxObject = {
  padding: 0,
};

const layoutStackSx: SxObject = {
  gap: 2,
  height: '100%',
  justifyContent: 'space-between',
  padding: 2.5,
  position: 'relative',
  // Per-glyph insurance on top of the backing layer, for the map's own labels.
  textShadow: `0 1px 2px ${paperMix(100)}, 0 0 8px ${paperMix(100)}`,
  zIndex: 3,
};

const BLEED = 2.5;
const FADE = 30;

/**
 * Each text group carries its own backing, so the route runs behind the copy
 * rather than through it. Anchoring the gradients to the groups instead of the
 * card keeps them aligned when the card changes shape or the description runs
 * long, and the fade distances are absolute so they always land on the first
 * line rather than drifting with the card's aspect ratio.
 */
const statsBackingSx: SxObject = {
  background: `linear-gradient(180deg, ${scrimMix(50, 34)} 0, ${scrimMix(44, 28)} ${FADE}px, transparent 100%)`,
  marginTop: -BLEED,
  marginX: -BLEED,
  paddingBottom: 2,
  paddingTop: BLEED,
  paddingX: BLEED,
};

const copyBackingSx: SxObject = {
  background: `linear-gradient(180deg, transparent 0, ${scrimMix(58, 38)} ${FADE}px, ${scrimMix(70, 48)} 55%, ${scrimMix(80, 58)} 100%)`,
  marginBottom: -BLEED,
  marginX: -BLEED,
  paddingBottom: BLEED,
  paddingTop: `${FADE}px`,
  paddingX: BLEED,
};

const activityNameSx: SxObject = {
  marginBottom: 1,
};

const mapSx: SxObject = {
  inset: 0,
  position: 'absolute',
  zIndex: 0,
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
    <ContentCard data-bento="activity" sx={cardSx}>
      {encodedPolyline ? (
        <Box sx={mapSx}>
          <StravaRouteMap encodedPolyline={encodedPolyline} />
        </Box>
      ) : null}
      <Stack sx={layoutStackSx}>
        <Box data-safe="activity-stats" sx={statsBackingSx}>
          <ActivityStats activity={activity} />
        </Box>
        <Stack sx={copyBackingSx}>
          <ActivityTypeWithIcon activity={activity} />
          <ActivityName activity={activity} sx={activityNameSx} />
          <ActivityDescription activity={activity} />
        </Stack>
      </Stack>
    </ContentCard>
  );
}
