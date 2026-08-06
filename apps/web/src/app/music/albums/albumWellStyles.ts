import type { SxObject } from '@dg/ui/theme';

/** Fixed gutter that keeps streamed track counts from shifting the text edge. */
export const ALBUM_WELL_TRACK_NUMBER_COLUMN = '1.5rem';

/** Space between the number gutter and the well's shared text edge. */
export const ALBUM_WELL_TRACK_COLUMN_GAP = 1.5;

/** Mobile art height included in the sticky-band offset. */
export const ALBUM_WELL_ART_SIZE_XS = 160;

/** Clears the glass header and the sorter's reserved fade band. */
export const ALBUM_WELL_STICKY_TOP = {
  sm: 'calc(var(--site-header-height, 5.5rem) + 115px)',
  xs: 'calc(var(--site-header-height, 5.5rem) + 94px)',
} as const;

/** Stable one-line height for the responsive h2 album-name variant. */
export const ALBUM_WELL_NAME_LINE = '2.25rem';

/** Gap below the album name inside its pinned band. */
export const ALBUM_WELL_NAME_GAP = '12px';

/** Opaque twin of the well surface, preventing tracks showing through pinned bands. */
export const ALBUM_WELL_PINNED_SURFACE =
  'color-mix(in srgb, var(--mui-palette-background-paper) 88%, var(--mui-palette-background-default))';

/** Shared gutter-and-text grid used by every pinned well band. */
export const albumWellBandSx: SxObject = {
  columnGap: ALBUM_WELL_TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
};

/** Sticky artist/facts band shared by streamed detail and its skeleton. */
export const albumWellMetaBandSx: SxObject = {
  ...albumWellBandSx,
  backgroundColor: ALBUM_WELL_PINNED_SURFACE,
  gridArea: 'meta',
  pb: 2,
  position: 'sticky',
  top: {
    sm: `calc(${ALBUM_WELL_STICKY_TOP.sm} + ${ALBUM_WELL_NAME_LINE} + ${ALBUM_WELL_NAME_GAP})`,
    xs: `calc(${ALBUM_WELL_STICKY_TOP.xs} + ${ALBUM_WELL_ART_SIZE_XS}px + ${ALBUM_WELL_NAME_LINE} + ${ALBUM_WELL_NAME_GAP})`,
  },
  zIndex: 2,
};

/** Text column inside the pinned artist/facts band. */
export const albumWellMetaTextSx: SxObject = {
  display: 'grid',
  gridColumn: 2,
  minWidth: 0,
  rowGap: 0.75,
};
