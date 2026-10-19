import { createTransition, EASING_DEFAULT, TIMING_FAST } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';

/** Radius shared by every cover in a grid cell, sleeves and front alike. */
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

/** How far each sleeve shifts from its neighbour, as a percent of the cover. */
const LAYER_STEP = 4;

/** Degrees of fan added per sleeve sitting behind the front cover. */
const LAYER_TILT = 1.5;

/** Percent of the page background mixed into each sleeve behind the front. */
const SLEEVE_RECESSION = 22;

/** Half the fan's width: how far its outermost cover sits from the middle. */
const MAX_FAN_SHIFT = (MAX_ALBUM_SLEEVES / 2) * LAYER_STEP;

/** A tilted square's bounding box grows by cos + sin of its angle. */
const FAN_TILT_GROWTH = (() => {
  const radians = ((MAX_ALBUM_SLEEVES * LAYER_TILT) / 180) * Math.PI;
  return Math.cos(radians) + Math.sin(radians);
})();

/**
 * Slack kept between a cover and the edge of its cell, in percent, rounded up
 * to a half percent.
 *
 * A fully fanned stack is the widest thing a cell has to hold, so the reserve
 * is what its outermost tilted sleeve needs to stay off the grid gap. Every
 * cover carries it — flat tile, front cover, sleeve, on either page — which is
 * what lets a lone cover and a stack share one cell size and one cover size.
 * Shifts are a percent of the cover rather than the cell, which is smaller, so
 * the reserve is if anything generous.
 */
const COVER_INSET_PERCENT = Math.ceil(2 * (50 - (50 - MAX_FAN_SHIFT) / FAN_TILT_GROWTH)) / 2;

/**
 * Stretches whatever a grid puts between a column and a tile.
 */
export const albumTileSlotSx: SxObject = {
  '& > *, & a': { display: 'block', width: '100%' },
};

/** The cell box: one grid column wide, square, with every cover inside it. */
export const albumTileFrameSx: SxObject = {
  aspectRatio: '1 / 1',
  position: 'relative',
  width: '100%',
};

/**
 * One cover of a stack: depth 0 is the front, deeper covers sit further back.
 * Sleeves share the front cover's box, radius, and shadow so a stack reads as
 * one object repeated rather than three unrelated squares; depth is carried by
 * the offset, the tilt, and the scrim below.
 *
 * The fan is centred on the cell, so a stack sits where a lone cover would and
 * neither ever changes size.
 */
export function albumCoverSx(depth: number, sleeveCount: number): SxObject {
  const shift = (depth - sleeveCount / 2) * LAYER_STEP;
  const spread = 'var(--album-fan-spread, 1)';
  const offset = `calc(${shift}% * ${spread})`;

  return {
    borderRadius: ALBUM_TILE_BORDER_RADIUS,
    boxShadow: 'var(--mui-extraShadows-card-main)',
    inset: `${COVER_INSET_PERCENT}%`,
    lineHeight: 0,
    overflow: 'hidden',
    position: 'absolute',
    transform: `translate(${offset}, calc(-1 * ${offset})) rotate(${depth * LAYER_TILT}deg)`,
    ...(depth > 0 ? { border: 'thin solid var(--mui-palette-card-border)' } : {}),
    ...albumArtHoverTransitionSx,
  };
}

/** Page background mixed over a sleeve so the fan recedes behind the front. */
export function albumSleeveScrimSx(depth: number): SxObject {
  return {
    backgroundColor: `color-mix(in srgb, var(--mui-palette-background-default) ${depth * SLEEVE_RECESSION}%, transparent)`,
    inset: 0,
    position: 'absolute',
  };
}
