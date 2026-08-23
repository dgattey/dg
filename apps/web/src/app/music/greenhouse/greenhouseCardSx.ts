import type { SxObject } from '@dg/ui/theme';

/**
 * Shared frost for greenhouse music cards. Same tokens as home `ContentCard`
 * (`--card-bg` / blur on `[data-greenhouse-frame]`); width overrides drop the
 * flag-off `85vw` so mobile cards share the home gutter.
 */
export const greenhouseCardSx: SxObject = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  height: '100%',
  justifySelf: 'stretch',
  maxWidth: 'none',
  minWidth: 0,
  overflow: 'visible',
  padding: 2.25,
  width: '100%',
};

/**
 * Same frost tokens as the homepage intro `ContentCard` (`composedCardSx`).
 * Headings and pile captions sit on this, not on the plate.
 */
export const greenhouseHeadingCardSx: SxObject = {
  ...greenhouseCardSx,
  backdropFilter: 'var(--card-backdrop-filter)',
  background: 'var(--card-bg)',
  borderColor: 'color-mix(in srgb, var(--mui-palette-common-white) 48%, transparent)',
  boxShadow: 'var(--card-box-shadow)',
  gap: 1,
  height: 'auto',
  justifyContent: 'flex-end',
  minHeight: 'auto',
  padding: { sm: '1.45rem 1.35rem 1.15rem 1.5rem', xs: '1.2rem 1.1rem' },
};

/**
 * Flag-off `StickyFadeBar` paints `100vw` cream bands. Kill that bleed when
 * the bar is nested in a greenhouse card so nothing escapes the column.
 */
export const containStickyBleedSx: SxObject = {
  '& [data-sticky-fade], & [data-sticky-surface]': {
    display: 'none !important',
    insetInlineStart: '0 !important',
    marginInlineStart: '0 !important',
    width: '100% !important',
  },
};

/** History / albums grid: intro frost, fans may paint past the pad. */
export const greenhouseWellCardSx: SxObject = {
  ...greenhouseHeadingCardSx,
  ...containStickyBleedSx,
  justifyContent: 'flex-start',
  overflow: 'visible',
};

/**
 * Four desktop columns so stacks read at ~original cover size or larger.
 * Flag-off stays on `ALBUM_GRID_COLUMNS` (6 / 4 / 3 / 2).
 */
export const GREENHOUSE_ALBUM_COLUMNS = { lg: 4, md: 3, sm: 3, xs: 2 } as const;

export const greenhouseCardHeaderSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
};

export const greenhouseListSx: SxObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
  minWidth: 0,
};

export const greenhouseRowSx: SxObject = {
  alignItems: 'center',
  color: 'inherit',
  display: 'grid',
  gap: 1.25,
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  minWidth: 0,
  textDecoration: 'none',
};

export const greenhouseThumbSx: SxObject = {
  borderRadius: 1,
  flexShrink: 0,
  height: 48,
  overflow: 'hidden',
  position: 'relative',
  width: 48,
};

export const GREENHOUSE_ROW_ART_SIZE = 96;

export const GREENHOUSE_ROW_ART_SIZES = {
  extraLarge: GREENHOUSE_ROW_ART_SIZE,
  tiny: GREENHOUSE_ROW_ART_SIZE,
} as const;

export const GREENHOUSE_STACK_ART_SIZE = 640;

export const GREENHOUSE_STACK_ART_SIZES = {
  extraLarge: 400,
  tiny: 360,
} as const;
