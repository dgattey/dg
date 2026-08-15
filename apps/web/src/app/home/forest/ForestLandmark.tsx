import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { layerZ, TILE_SIZE } from './forestMap';
import {
  carvedSignLabelSx,
  carvedSignSx,
  createBouncyTransition,
  LANDMARK_POST_HEIGHT,
  landmarkFrameSx,
  landmarkNearSx,
  landmarkSurfaceSx,
} from './forestMaterials';

export const LANDMARK_ATTRIBUTE = 'data-forest-landmark';
export const LANDMARK_NEAR_ATTRIBUTE = 'data-forest-near';

const landmarkSx: SxObject = {
  position: 'absolute',
};

const stackSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  position: 'absolute',
  top: 0,
  transform: 'translate(-50%, -100%)',
};

const postsSx: SxObject = {
  '&::after, &::before': {
    background:
      'linear-gradient(180deg, var(--forest-wood-light) 0 3px, var(--forest-wood) 10px, var(--forest-wood-dark) 100%)',
    boxShadow: 'inset 1px 0 0 var(--forest-wood-light), inset -2px 0 3px rgb(0 0 0 / 0.3)',
    content: '""',
    display: 'block',
    height: LANDMARK_POST_HEIGHT,
    width: 12,
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

const groundBedSx: SxObject = {
  '&::after': {
    background:
      'radial-gradient(ellipse at 18% 52%, var(--forest-rock) 0 4px, transparent 5px), radial-gradient(ellipse at 78% 58%, var(--forest-rock-light) 0 3px, transparent 4px)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  background:
    'radial-gradient(ellipse at 50% 58%, var(--forest-path) 0 52%, var(--forest-sand) 70%, transparent 84%)',
  height: 42,
  marginTop: -18,
  pointerEvents: 'none',
  position: 'relative',
  width: 280,
};

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
};

export function ForestLandmark({ children, id, label, tileX, tileY }: ForestLandmarkProps) {
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
        <Box data-role="forest-frame" sx={{ ...landmarkFrameSx, ...nearFrameSx }}>
          <Box aria-hidden="true" sx={carvedSignSx}>
            <Typography component="span" sx={carvedSignLabelSx} variant="caption">
              {label}
            </Typography>
          </Box>
          <Box sx={landmarkSurfaceSx}>{children}</Box>
        </Box>
        <Box aria-hidden="true" data-role="forest-posts" sx={postsSx} />
        <Box aria-hidden="true" data-role="forest-dirt" sx={groundBedSx} />
        <Box aria-hidden="true" data-role="forest-shadow" sx={groundShadowSx} />
      </Box>
    </Box>
  );
}
