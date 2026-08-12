import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { TILE_SIZE } from './forestMap';

/**
 * One homepage card planted in a clearing, with a carved sign naming the spot.
 *
 * Server-rendered: the card inside is whatever the normal grid would have shown,
 * so data fetching, links and hover behaviour are untouched. The only thing the
 * walker does to a landmark is flip `data-forest-near`, which this styles.
 */

/** Attribute the client walker reads to find landmarks and mark the closest. */
export const LANDMARK_ATTRIBUTE = 'data-forest-landmark';
export const LANDMARK_NEAR_ATTRIBUTE = 'data-forest-near';

/** Gap between the trail and the bottom of the signpost, in pixels. */
const POST_HEIGHT = 18;

/** The anchor is a zero-sized point on the plot's centre tile, right on the trail. */
const landmarkSx: SxObject = {
  '--forest-sign': 'light-dark(hsl(32deg 44% 78%), hsl(28deg 24% 28%))',
  '--forest-sign-active': 'light-dark(hsl(38deg 82% 74%), hsl(24deg 44% 38%))',
  position: 'absolute',
};

/** Everything visible stands north of the anchor so the trail stays walkable. */
const stackSx: SxObject = {
  [`[${LANDMARK_NEAR_ATTRIBUTE}='true'] &`]: {
    '& [data-role="forest-sign"]': { backgroundColor: 'var(--forest-sign-active)' },
    transform: 'translateX(-50%) scale(1.04)',
  },
  alignItems: 'center',
  bottom: POST_HEIGHT,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  left: 0,
  position: 'absolute',
  transform: 'translateX(-50%)',
  transformOrigin: 'bottom center',
  ...createBouncyTransition('transform'),
  willChange: 'transform',
};

const signSx: SxObject = {
  backgroundColor: 'var(--forest-sign)',
  border: '2px solid var(--forest-bark)',
  borderRadius: '4px',
  boxShadow: '0 2px 0 var(--forest-bark-dark)',
  color: 'light-dark(hsl(24deg 34% 24%), hsl(38deg 44% 84%))',
  paddingBlock: 0.25,
  paddingInline: 1,
  position: 'relative',
  whiteSpace: 'nowrap',
  ...createBouncyTransition('background-color'),
  '&::after': {
    backgroundColor: 'var(--forest-bark)',
    bottom: -POST_HEIGHT,
    content: '""',
    height: POST_HEIGHT,
    left: 'calc(50% - 2px)',
    position: 'absolute',
    width: 4,
  },
};

const signLabelSx: SxObject = {
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

/**
 * A mown pad under whatever card is planted here. Real cards bring their own
 * paper so it never shows through them; it exists for the intro copy, which is
 * deliberately surface-less in the grid and would otherwise be text on grass.
 */
const contentSx: SxObject = {
  backdropFilter: 'blur(2px)',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-default) 72%, transparent)',
  borderRadius: 6,
  boxShadow: '0 0 0 6px color-mix(in srgb, var(--forest-clearing) 55%, transparent)',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxWidth: TILE_SIZE * 7,
  overflow: 'visible',
  padding: 1,
  position: 'relative',
};

type ForestLandmarkProps = {
  children: ReactNode;
  id: string;
  label: string;
  tileX: number;
  tileY: number;
};

export function ForestLandmark({ children, id, label, tileX, tileY }: ForestLandmarkProps) {
  return (
    <Box
      {...{ [LANDMARK_ATTRIBUTE]: id }}
      sx={{
        ...landmarkSx,
        left: tileX * TILE_SIZE + TILE_SIZE / 2,
        top: tileY * TILE_SIZE + TILE_SIZE / 2,
      }}
    >
      <Box sx={stackSx}>
        <Box sx={contentSx}>{children}</Box>
        <Box aria-hidden="true" data-role="forest-sign" sx={signSx}>
          <Typography component="span" sx={signLabelSx} variant="caption">
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
