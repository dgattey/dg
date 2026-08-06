import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';

/** Shared radius for compact album covers. */
export const ALBUM_ART_BASE_RADIUS = 2;

/** Shared lift applied to interactive album art. */
export const ALBUM_ART_HOVER_SCALE = 1.05;

/** Shared motion for the album-art hover lift. */
export const albumArtHoverTransitionSx: SxObject = createBouncyTransition('transform');

/** Standard album art size in px for the now-playing card. */
export const ALBUM_ART_SIZE = 150;

/** Interactive link around the now-playing card's album art. */
export const albumArtLinkSx: SxObject = {
  '&:focus-visible, &:hover': { transform: `scale(${ALBUM_ART_HOVER_SCALE})` },
  display: 'block',
  ...albumArtHoverTransitionSx,
};

/** Responsive --image-dim CSS variable map for now-playing album art sizing. */
export const ALBUM_ART_DIMENSIONS: SxObject = {
  '--image-dim': {
    md: `${ALBUM_ART_SIZE}px`,
    sm: `${(4 * ALBUM_ART_SIZE) / 5}px`,
    xs: `${(2 * ALBUM_ART_SIZE) / 3}px`,
  },
};

/** Responsive radius for the card's art, which is larger than a grid tile. */
export const ALBUM_ART_BORDER_RADIUS: SxObject = {
  borderRadius: { md: 6, sm: 4, xs: ALBUM_ART_BASE_RADIUS },
};
