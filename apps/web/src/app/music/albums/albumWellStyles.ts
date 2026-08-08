import type { SxObject } from '@dg/ui/theme';

/** Fixed gutter that keeps streamed track counts from shifting the text edge. */
export const ALBUM_WELL_TRACK_NUMBER_COLUMN = '1.5rem';

/** Space between the number gutter and the well's shared text edge. */
export const ALBUM_WELL_TRACK_COLUMN_GAP = 1.5;

/** Mobile art width. */
export const ALBUM_WELL_ART_SIZE_XS = 160;

/**
 * Where the well's art pins: clear of the glass header, the sorter bar, and the
 * whole of the sorter's fade, so it is never tinted by the ramp's tail. The
 * ramp measures 111px below the header at `sm` and 112px at `xs` — the mobile
 * bar's icon button is a shade taller than the pill row — so one offset covers
 * both with a few pixels to spare.
 */
export const ALBUM_WELL_STICKY_TOP = 'calc(var(--site-header-height, 5.5rem) + 117px)';

/** Stable one-line height for the responsive h2 album-name variant. */
export const ALBUM_WELL_NAME_LINE = '2.25rem';

/** Gap below the album name. */
export const ALBUM_WELL_NAME_GAP = '12px';

/** Shared gutter-and-text grid, so the name and meta share the tracklist's edge. */
export const albumWellTextGridSx: SxObject = {
  columnGap: ALBUM_WELL_TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
};

/**
 * Artist and facts, shared by streamed detail and its skeleton.
 *
 * Deliberately not sticky. Pinned here it covered three tracklist rows at 1280
 * and four at 390 — a static frame read as track 10, album metadata, track 12 —
 * and every treatment that stopped rows showing through it only made the rows
 * it swallowed disappear more completely. Nothing in the album header is
 * navigation, so it scrolls away like the rest of the card and the tracklist
 * has no overlay to pass under.
 */
export const albumWellMetaRowSx: SxObject = {
  ...albumWellTextGridSx,
  gridArea: 'meta',
  pb: 2,
};

/** Text column inside the artist/facts row. */
export const albumWellMetaTextSx: SxObject = {
  display: 'grid',
  gridColumn: 2,
  minWidth: 0,
  rowGap: 0.75,
};
