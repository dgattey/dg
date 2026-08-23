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
  padding: 2.25,
  width: '100%',
};

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
