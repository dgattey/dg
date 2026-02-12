import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';

/** Standard album art size in px */
export const ALBUM_ART_SIZE = 150;

/** Standard hover scale for album art */
export const ALBUM_ART_HOVER_SCALE = 1.05;

/** Bouncy hover link style for album art */
export const albumArtLinkSx: SxObject = {
  '&:hover': { transform: `scale(${ALBUM_ART_HOVER_SCALE})` },
  display: 'block',
  ...createBouncyTransition('transform'),
};

/** Responsive --image-dim CSS variable map for album art sizing */
export const ALBUM_ART_DIMENSIONS: SxObject = {
  '--image-dim': {
    md: `${ALBUM_ART_SIZE}px`,
    sm: `${(4 * ALBUM_ART_SIZE) / 5}px`,
    xs: `${(2 * ALBUM_ART_SIZE) / 3}px`,
  },
};

/** Responsive border radius for album art */
export const ALBUM_ART_BORDER_RADIUS: SxObject = {
  borderRadius: { md: 6, sm: 4, xs: 2 },
};
