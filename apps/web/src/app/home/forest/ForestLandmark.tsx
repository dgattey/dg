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
 * A `board` is a steel-edged crate sitting in its clearing — same plane as
 * the grass, no isolated rotateX. South-side grass may paint in front of the
 * posts by `layerZ(tileY)`. World trees stay off the nameplate, photograph,
 * and copy. The content inside is the same card the grid renders; its surface
 * is dissolved (see `dissolveInnerCardSx`).
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

/**
 * Flat plaque on the dirt. Shares the world's plane — no per-card perspective.
 *
 * The landmark node is a zero-size anchor on the trail tile. `bottom: 0` on a
 * 0×0 containing block does not lift the stack in Chrome — the plaque grew
 * down over the south grove and the photograph sat where the map thought the
 * posts were. Translate the whole stack above the anchor so nameplate, photo
 * and copy occupy the reserved footprint north of the plot.
 */
const stackSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  position: 'absolute',
  top: 0,
  transform: 'translate(-50%, -100%)',
};

/** Two short posts under the frame, planted in the dirt. */
const postsSx: SxObject = {
  '&::after, &::before': {
    background:
      'linear-gradient(180deg, var(--forest-steel) 0 3px, var(--forest-wood) 5px, var(--forest-wood-dark) 100%)',
    boxShadow: 'inset 1px 0 0 var(--forest-wood-light), inset -1px 0 2px rgb(0 0 0 / 0.4)',
    content: '""',
    display: 'block',
    height: LANDMARK_POST_HEIGHT,
    width: 8,
  },
  display: 'flex',
  height: LANDMARK_POST_HEIGHT,
  justifyContent: 'space-between',
  marginTop: '-2px',
  pointerEvents: 'none',
  position: 'relative',
  width: '54%',
  zIndex: 1,
};

/** Packed slag and gravel under the posts. Opaque enough to read as a bed, not a hint. */
const groundBedSx: SxObject = {
  '&::after': {
    background:
      'radial-gradient(ellipse at 18% 52%, var(--forest-rock) 0 4px, transparent 5px), radial-gradient(ellipse at 78% 58%, var(--forest-steel) 0 3px, transparent 4px), radial-gradient(ellipse at 46% 72%, var(--forest-rock) 0 2.6px, transparent 3.4px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  background:
    'radial-gradient(ellipse at 50% 58%, var(--forest-path) 0 52%, var(--forest-trail) 70%, transparent 84%)',
  height: 42,
  marginTop: -18,
  pointerEvents: 'none',
  position: 'relative',
  width: 280,
};

/** Hard contact shadow on the grass under the crate. */
const groundShadowSx: SxObject = {
  background: 'radial-gradient(ellipse at 56% 42%, var(--forest-shadow) 0 46%, transparent 72%)',
  height: 40,
  marginTop: -24,
  pointerEvents: 'none',
  position: 'relative',
  width: 320,
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
      <Box data-role="forest-stack" sx={stackSx}>
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
        <Box aria-hidden="true" data-role="forest-posts" sx={postsSx} />
        <Box aria-hidden="true" data-role="forest-dirt" sx={groundBedSx} />
        <Box aria-hidden="true" data-role="forest-shadow" sx={groundShadowSx} />
      </Box>
    </Box>
  );
}
