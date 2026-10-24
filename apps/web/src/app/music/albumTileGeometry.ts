import { createTransition, EASING_DEFAULT, TIMING_FAST } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';

const ALBUM_TILE_BORDER_RADIUS = 1.5;

const albumArtHoverTransitionSx: SxObject = {
  transition: createTransition('transform', TIMING_FAST, EASING_DEFAULT),
};

/** Sleeves drawn behind a front cover at most, however long the run is. */
export const MAX_ALBUM_SLEEVES = 2;

/** Intrinsic art size requested for a cover, then sized down per breakpoint. */
export const ALBUM_TILE_ART_SIZE = 300;

/** Art widths per breakpoint, a little above a cell so covers stay crisp. */
export const ALBUM_TILE_ART_SIZES = { extraLarge: 200, medium: 200, tiny: 180 } as const;

const LAYER_SHIFT_PERCENT = 4;
const LAYER_TILT_DEG = 1.5;
const SLEEVE_RECESSION_PERCENT = 22;
const MAX_FAN_SHIFT = (MAX_ALBUM_SLEEVES / 2) * LAYER_SHIFT_PERCENT;

/** A tilted square's bounding box grows by cos + sin of its angle. */
const FAN_TILT_GROWTH = (() => {
  const radians = ((MAX_ALBUM_SLEEVES * LAYER_TILT_DEG) / 180) * Math.PI;
  return Math.cos(radians) + Math.sin(radians);
})();

const COVER_INSET_PERCENT = Math.ceil(2 * (50 - (50 - MAX_FAN_SHIFT) / FAN_TILT_GROWTH)) / 2;

export const albumTileSlotSx: SxObject = {
  '& > *, & a': { display: 'block', width: '100%' },
};

export const albumTileFrameSx: SxObject = {
  aspectRatio: '1 / 1',
  position: 'relative',
  width: '100%',
};

export function albumCoverSx(depth: number, sleeveCount: number): SxObject {
  const shift = (depth - sleeveCount / 2) * LAYER_SHIFT_PERCENT;
  const spread = 'var(--album-fan-spread, 1)';
  const offset = `calc(${shift}% * ${spread})`;

  return {
    borderRadius: ALBUM_TILE_BORDER_RADIUS,
    boxShadow: 'var(--dg-shadow-card-main)',
    inset: `${COVER_INSET_PERCENT}%`,
    lineHeight: 0,
    overflow: 'hidden',
    position: 'absolute',
    transform: `translate(${offset}, calc(-1 * ${offset})) rotate(${depth * LAYER_TILT_DEG}deg)`,
    ...(depth > 0 ? { border: 'thin solid var(--dg-palette-card-border)' } : {}),
    ...albumArtHoverTransitionSx,
  };
}

export function albumSleeveScrimSx(depth: number): SxObject {
  return {
    backgroundColor: `color-mix(in srgb, var(--dg-palette-background-default) ${depth * SLEEVE_RECESSION_PERCENT}%, transparent)`,
    inset: 0,
    position: 'absolute',
  };
}
