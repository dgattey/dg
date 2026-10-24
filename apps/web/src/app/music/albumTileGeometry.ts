import type { CSSProperties } from 'react';

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

export function albumCoverStyle(depth: number, sleeveCount: number): CSSProperties {
  const shift = (depth - sleeveCount / 2) * LAYER_SHIFT_PERCENT;
  const spread = 'var(--album-fan-spread, 1)';
  const offset = `calc(${shift}% * ${spread})`;

  return {
    inset: `${COVER_INSET_PERCENT}%`,
    transform: `translate(${offset}, calc(-1 * ${offset})) rotate(${depth * LAYER_TILT_DEG}deg)`,
  };
}

export function albumSleeveScrimStyle(depth: number): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, var(--dg-palette-background-default) ${depth * SLEEVE_RECESSION_PERCENT}%, transparent)`,
  };
}
