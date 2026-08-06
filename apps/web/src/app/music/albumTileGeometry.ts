import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';

/**
 * Columns every album grid uses. Exported because the album well has to know
 * how many cells sit in a row to land at the end of one.
 */
export const ALBUM_GRID_COLUMNS = { lg: 6, md: 4, sm: 3, xs: 2 } as const;

/**
 * The one grid both music pages render into. Cells are a column wide rather
 * than a fixed pixel size: a fixed size leaves a column's worth of slack at
 * wide viewports, and the two pages only agree on tile size if neither of them
 * is guessing at it.
 */
export const albumGridSx: SxObject = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: `repeat(${ALBUM_GRID_COLUMNS.lg}, 1fr)`,
    md: `repeat(${ALBUM_GRID_COLUMNS.md}, 1fr)`,
    sm: `repeat(${ALBUM_GRID_COLUMNS.sm}, 1fr)`,
    xs: `repeat(${ALBUM_GRID_COLUMNS.xs}, 1fr)`,
  },
};

/** Radius shared by every cover in a grid cell, sleeves and front alike. */
export const ALBUM_TILE_BORDER_RADIUS = 2;

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

/** How much wider the fan spreads while hovered or focused. */
const HOVER_SPREAD = 1.5;

/** Percent of the page background mixed into each sleeve behind the front. */
const SLEEVE_RECESSION = 22;

/** Lift on hover, shared so every cell grows by the same amount. */
const HOVER_SCALE = 1.05;

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
 * Stretches whatever a grid puts between a column and a tile. An internal
 * `Link` renders a bare anchor around the element it styles, and a `Tooltip`
 * wraps that anchor in an inline-flex span; a tile sized as a percent of either
 * has nothing to resolve against, and since its covers are absolutely
 * positioned, the whole cell collapses to nothing. Grids whose cells sit
 * directly in the grid get this for free — grid items are blockified — so this
 * is for the ones that put a slot in between.
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
 * The anchor around a whole cell. Hover lifts the cell and widens the fan
 * under it, and the lifted cell paints over its neighbours rather than under.
 */
export const albumTileLinkSx: SxObject = {
  '--album-fan-spread': 1,
  '&:focus-visible, &:hover': {
    '--album-fan-spread': HOVER_SPREAD,
    transform: `scale(${HOVER_SCALE})`,
    zIndex: 1,
  },
  display: 'block',
  position: 'relative',
  width: '100%',
  ...createBouncyTransition('transform'),
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
    ...createBouncyTransition('transform'),
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

/**
 * Placeholder for a loading cell. It fills a whole cell so a grid of them is
 * exactly as tall as the loaded grid, but paints only where a cover will.
 */
export const albumTileSkeletonSx: SxObject = {
  borderRadius: ALBUM_TILE_BORDER_RADIUS,
  inset: `${COVER_INSET_PERCENT}%`,
  position: 'absolute',
};
