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
  // Attribute on this card so we beat `.cell [data-bento] { height: 100% }`
  // without touching GreenhouseGrid. Width + height together drop aspect-ratio.
  '[data-greenhouse-frame] &[data-bento="activity"]': {
    '--map-scrim-opacity': 0.04,
    // Brand route hue at full saturation — reads as Strava orange, not burnt sienna.
    '--route-casing': '#fff8ec',
    '--route-casing-width': 7,
    '--route-line': '#f0701a',
    '--route-line-filter': 'drop-shadow(0 1px 3px rgb(0 0 0 / 0.25))',
    '--route-stroke-width': 4,
    '& [data-activity-when]': {
      display: 'block',
    },
    aspectRatio: { md: '16 / 9', xs: '4 / 3' },
    border: 'none',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
    height: 'auto !important',
    maxWidth: 'none',
    minHeight: 0,
    overflow: 'hidden',
    width: '100%',
  },
  padding: 0,
};

const layoutStackSx: SxObject = {
  '[data-greenhouse-frame] &': {
    gridArea: '1 / 1',
    height: '100%',
    justifyContent: 'space-between',
    minHeight: 0,
    padding: 1.5,
    textShadow: 'none',
    width: '100%',
  },
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
  '[data-greenhouse-frame] &': {
    backdropFilter: 'blur(14px) saturate(140%)',
    background: 'color-mix(in srgb, var(--mui-palette-background-paper) 74%, transparent)',
    borderRadius: '999px',
    boxShadow:
      'inset 0 1px 0 color-mix(in srgb, white 70%, transparent), 0 1px 3px rgb(40 28 12 / 0.1)',
    margin: 0,
    paddingBottom: '0.42rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.85rem',
    paddingTop: '0.42rem',
    width: 'fit-content',
  },
  background: `linear-gradient(180deg, ${scrimMix(50, 34)} 0, ${scrimMix(44, 28)} ${FADE}px, transparent 100%)`,
  marginTop: -BLEED,
  marginX: -BLEED,
  paddingBottom: 2,
  paddingTop: BLEED,
  paddingX: BLEED,
};

const copyBackingSx: SxObject = {
  '[data-greenhouse-frame] &': {
    backdropFilter: 'blur(14px) saturate(140%)',
    background: 'color-mix(in srgb, var(--mui-palette-background-paper) 78%, transparent)',
    borderRadius: '1rem',
    boxShadow:
      'inset 0 1px 0 color-mix(in srgb, white 70%, transparent), 0 1px 3px rgb(40 28 12 / 0.1)',
    margin: 0,
    padding: '0.7rem 0.85rem 0.75rem',
    width: '100%',
  },
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
  '[data-greenhouse-frame] &': {
    gridArea: '1 / 1',
    height: '100%',
    inset: 'auto',
    minHeight: 0,
    position: 'relative',
    width: '100%',
  },
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%',
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
        <Box sx={statsBackingSx}>
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
