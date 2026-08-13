import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { type LandmarkRegion, TILE_SIZE } from './forestMap';
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

export type LandmarkVariant = 'board' | 'grove';

/** The anchor is a zero-sized point on the plot's centre tile, right on the trail. */
const landmarkSx: SxObject = {
  position: 'absolute',
};

/** Everything visible stands north of the anchor so the trail stays walkable. */
const stackSx: SxObject = {
  [`[${LANDMARK_NEAR_ATTRIBUTE}='true'] &`]: {
    transform: 'translateX(-50%) scale(1.03)',
  },
  alignItems: 'center',
  bottom: LANDMARK_POST_HEIGHT,
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

/** Two posts sinking the board into the trail below it. */
const postsSx: SxObject = {
  '&::after': { right: '22%' },
  '&::before': { left: '22%' },
  '&::before, &::after': {
    backgroundColor: 'var(--forest-wood-dark)',
    borderRadius: '2px',
    bottom: -LANDMARK_POST_HEIGHT,
    content: '""',
    height: LANDMARK_POST_HEIGHT + 4,
    position: 'absolute',
    width: 5,
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
  region: LandmarkRegion;
  tileX: number;
  tileY: number;
  variant?: LandmarkVariant;
};

const REGION_LABEL: Record<LandmarkRegion, string> = {
  'forest-grove': 'Forest grove',
  lakeside: 'Lakeside',
  'meadow-camp': 'Meadow camp',
  'mountain-overlook': 'Mountain overlook',
  'rocky-shore': 'Rocky shore',
  wetland: 'Wetland boardwalk',
};

export function ForestLandmark({
  children,
  id,
  label,
  region,
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
      }}
    >
      <Box sx={stackSx}>
        <Box sx={postsSx}>
          <Box data-role="forest-frame" sx={frameSx}>
            <Box aria-hidden="true" sx={carvedSignSx}>
              <Typography component="span" sx={carvedSignLabelSx} variant="caption">
                {label}
              </Typography>
              <Typography
                component="span"
                sx={{ display: 'block', opacity: 0.72 }}
                variant="caption"
              >
                {REGION_LABEL[region]}
              </Typography>
            </Box>
            <Box sx={surfaceSx}>{children}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
