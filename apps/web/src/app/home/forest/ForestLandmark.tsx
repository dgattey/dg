import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { layerZ, TILE_SIZE } from './forestMap';
import {
  carvedSignLabelSx,
  carvedSignSx,
  createBouncyTransition,
  groveStageSx,
  groveSurfaceSx,
  LANDMARK_POST_HEIGHT,
  landmarkFrameSx,
  landmarkNearSx,
  landmarkSurfaceSx,
} from './forestMaterials';

/**
 * One homepage card mounted on a world-native landmark.
 *
 * A `board` is a carved wooden plaque on two posts, standing in its clearing; a
 * `grove` is a rounded stone stage for the now-playing card, left open so the
 * album glow can bloom past it. Either way the content inside is the same card
 * the grid renders — its surface is dissolved (see `dissolveInnerCardSx`) so it
 * reads as content on the board, not a card pasted on top, while its links,
 * hover, focus and data fetching are untouched.
 *
 * The only thing the walker does to a landmark is flip `data-forest-near`, which
 * lights its lantern.
 */

/** Attribute the client walker reads to find landmarks and mark the closest. */
export const LANDMARK_ATTRIBUTE = 'data-forest-landmark';
export const LANDMARK_NEAR_ATTRIBUTE = 'data-forest-near';
export const PIXELATE_ATTRIBUTE = 'data-forest-pixelate';

export type LandmarkVariant = 'board' | 'grove';

/** The anchor is a zero-sized point on the plot's centre tile, right on the trail. */
const landmarkSx: SxObject = {
  position: 'absolute',
};

/** Everything visible stands north of the anchor so the trail stays walkable. */
const stackSx: SxObject = {
  [`[${LANDMARK_NEAR_ATTRIBUTE}='true'] &`]: {
    transform: 'translateX(-50%) perspective(640px) rotateX(10deg) scale(1.02)',
  },
  alignItems: 'center',
  bottom: LANDMARK_POST_HEIGHT,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  left: 0,
  position: 'absolute',
  transform: 'translateX(-50%) perspective(640px) rotateX(10deg)',
  transformOrigin: 'bottom center',
  ...createBouncyTransition('transform'),
};

/** Contact at the post feet only — a wide oval under the plaque reads as a floating card. */
const groundShadowSx: SxObject = {
  background:
    'radial-gradient(ellipse at 30% 45%, var(--forest-shadow) 0 7px, transparent 12px), radial-gradient(ellipse at 70% 45%, var(--forest-shadow) 0 7px, transparent 12px)',
  height: 18,
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: 6,
  transform: 'translateX(-50%)',
  width: 72,
};

/** Dirt, moss and pebbles packed around the post feet. */
const groundBedSx: SxObject = {
  '&::after': {
    background:
      'radial-gradient(ellipse at 26% 48%, var(--forest-rock) 0 3.4px, transparent 4.2px), radial-gradient(ellipse at 74% 58%, var(--forest-rock-light) 0 2.8px, transparent 3.6px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  '&::before': {
    background:
      'radial-gradient(ellipse at 22% 36%, var(--forest-canopy) 0 5px, transparent 6px), radial-gradient(ellipse at 78% 30%, var(--forest-canopy-pine) 0 4.5px, transparent 5.5px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  background:
    'radial-gradient(ellipse at 32% 50%, var(--forest-sand) 0 28%, transparent 48%), radial-gradient(ellipse at 68% 50%, var(--forest-sand) 0 28%, transparent 48%)',
  height: 16,
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: 4,
  transform: 'translateX(-50%)',
  width: 78,
};

/** Two posts sinking the board into the dirt bed below it. */
const postsSx: SxObject = {
  '&::after': { right: '22%' },
  '&::before': { left: '22%' },
  '&::before, &::after': {
    background:
      'linear-gradient(90deg, var(--forest-wood-dark), var(--forest-wood) 40%, var(--forest-wood-dark))',
    borderRadius: '2px 2px 1px 1px',
    bottom: -LANDMARK_POST_HEIGHT,
    content: '""',
    height: LANDMARK_POST_HEIGHT + 10,
    position: 'absolute',
    width: 8,
  },
  position: 'relative',
};

const nearFrameSx: SxObject = {
  [`[${LANDMARK_NEAR_ATTRIBUTE}='true'] &`]: landmarkNearSx,
  ...createBouncyTransition('box-shadow'),
};

type ForestLandmarkProps = {
  children: ReactNode;
  id: string;
  label: string;
  tileX: number;
  tileY: number;
  variant?: LandmarkVariant;
};

export function ForestLandmark({
  children,
  id,
  label,
  tileX,
  tileY,
  variant = 'board',
}: ForestLandmarkProps) {
  const isGrove = variant === 'grove';
  const frameSx = { ...(isGrove ? groveStageSx : landmarkFrameSx), ...nearFrameSx };
  const surfaceSx = isGrove ? groveSurfaceSx : landmarkSurfaceSx;

  return (
    <Box
      {...{ [LANDMARK_ATTRIBUTE]: id }}
      sx={{
        ...landmarkSx,
        left: tileX * TILE_SIZE + TILE_SIZE / 2,
        top: tileY * TILE_SIZE + TILE_SIZE / 2,
        zIndex: layerZ(tileY),
      }}
    >
      <Box aria-hidden="true" sx={groundShadowSx} />
      <Box aria-hidden="true" sx={groundBedSx} />
      <Box sx={stackSx}>
        <Box sx={postsSx}>
          <Box data-role="forest-frame" sx={frameSx}>
            <Box aria-hidden="true" sx={carvedSignSx}>
              <Typography component="span" sx={carvedSignLabelSx} variant="caption">
                {label}
              </Typography>
            </Box>
            <Box {...{ [PIXELATE_ATTRIBUTE]: true }} sx={surfaceSx}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
