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
    transform: 'translateX(-50%) scale(1.015)',
  },
  alignItems: 'center',
  bottom: LANDMARK_POST_HEIGHT,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  left: 0,
  position: 'absolute',
  transform: 'translateX(-50%)',
  transformOrigin: 'bottom center',
  ...createBouncyTransition('transform'),
};

/** Soft oval on the grass under the whole plaque — not a Material drop shadow. */
const groundShadowSx: SxObject = {
  background: 'radial-gradient(ellipse at 50% 45%, var(--forest-shadow) 0 38%, transparent 78%)',
  height: 52,
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: 4,
  transform: 'translateX(-50%)',
  width: 360,
};

/** Packed dirt and moss the posts sink into. Irregular so it does not read as a platform. */
const groundBedSx: SxObject = {
  '&::after': {
    background:
      'radial-gradient(ellipse at 16% 58%, var(--forest-rock) 0 4px, transparent 5px), radial-gradient(ellipse at 82% 64%, var(--forest-rock-light) 0 3.4px, transparent 4.4px), radial-gradient(ellipse at 48% 78%, var(--forest-rock) 0 2.8px, transparent 3.6px), radial-gradient(ellipse at 64% 42%, var(--forest-rock-light) 0 2.2px, transparent 3px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  '&::before': {
    background:
      'radial-gradient(ellipse at 10% 22%, var(--forest-canopy) 0 18px, transparent 20px), radial-gradient(ellipse at 90% 18%, var(--forest-canopy-pine) 0 16px, transparent 18px), radial-gradient(ellipse at 38% 8%, var(--forest-canopy-light) 0 14px, transparent 16px), radial-gradient(ellipse at 70% 12%, var(--forest-canopy-maple) 0 12px, transparent 14px), radial-gradient(ellipse at 52% 86%, var(--forest-grass) 0 28px, transparent 32px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  background:
    'radial-gradient(ellipse at 24% 58%, var(--forest-sand) 0 34%, transparent 62%), radial-gradient(ellipse at 76% 62%, var(--forest-sand) 0 30%, transparent 58%), radial-gradient(ellipse at 48% 72%, var(--forest-path) 0 26%, transparent 52%), radial-gradient(ellipse at 58% 40%, var(--forest-path) 0 16%, transparent 38%)',
  height: 44,
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: 2,
  transform: 'translateX(-50%)',
  width: 320,
};

/** Grass and dirt eating the bottom edge of the board so the rectangle dissolves. */
const groundFringeSx: SxObject = {
  background:
    'radial-gradient(ellipse at 12% 70%, var(--forest-canopy) 0 16px, transparent 18px), radial-gradient(ellipse at 30% 90%, var(--forest-grass) 0 22px, transparent 24px), radial-gradient(ellipse at 52% 78%, var(--forest-canopy-light) 0 18px, transparent 20px), radial-gradient(ellipse at 74% 92%, var(--forest-grass) 0 20px, transparent 22px), radial-gradient(ellipse at 90% 68%, var(--forest-canopy-pine) 0 14px, transparent 16px), radial-gradient(ellipse at 44% 100%, var(--forest-sand) 0 12px, transparent 14px)',
  bottom: LANDMARK_POST_HEIGHT - 8,
  height: 36,
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translateX(-50%)',
  width: 300,
  zIndex: 4,
};

/** Two posts sinking the board into the dirt bed below it. */
const postsSx: SxObject = {
  '&::after': { right: '18%' },
  '&::before': { left: '18%' },
  '&::before, &::after': {
    background:
      'linear-gradient(90deg, var(--forest-wood-dark), var(--forest-wood) 38%, var(--forest-wood-light) 52%, var(--forest-wood-dark))',
    borderRadius: '3px 3px 1px 1px',
    bottom: -LANDMARK_POST_HEIGHT,
    content: '""',
    height: LANDMARK_POST_HEIGHT + 16,
    position: 'absolute',
    width: 11,
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
      <Box aria-hidden="true" sx={groundFringeSx} />
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
