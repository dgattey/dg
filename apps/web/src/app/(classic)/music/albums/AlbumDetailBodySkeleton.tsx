import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton } from '@mui/material';
import {
  ALBUM_WELL_TRACK_COLUMN_GAP,
  ALBUM_WELL_TRACK_NUMBER_COLUMN,
  albumWellMetaRowSx,
  albumWellMetaTextSx,
} from './albumWellStyles';
import styles from './FavoriteAlbums.module.css';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);

const rowSx: SxObject = {
  columnGap: ALBUM_WELL_TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
  py: 1,
};

const collageMetaRowSx: SxObject = {
  gridArea: 'meta',
  mt: '10px',
};

const collageMetaTextSx: SxObject = {
  display: 'grid',
  minWidth: 0,
  rowGap: '6px',
};

const collageRowSx: SxObject = {
  columnGap: '10px',
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
  py: '6px',
};

const collageTrackListSx: SxObject = {
  columnCount: { md: 2, xs: 1 },
  columnGap: '34px',
  display: 'block',
  gridArea: 'tracks',
  mt: '22px',
};

type AlbumDetailSkeletonSurfaceStyles = {
  metaRow: SxObject;
  metaText: SxObject;
  row: SxObject;
  trackList: SxObject;
};

const ALBUM_DETAIL_SKELETON_SURFACE_STYLES = {
  classic: {
    metaRow: albumWellMetaRowSx,
    metaText: albumWellMetaTextSx,
    row: rowSx,
    trackList: { display: 'grid', gap: 0.5, gridArea: 'tracks' },
  },
  collage: {
    metaRow: collageMetaRowSx,
    metaText: collageMetaTextSx,
    row: collageRowSx,
    trackList: collageTrackListSx,
  },
} satisfies Record<SiteSurface, AlbumDetailSkeletonSurfaceStyles>;

/**
 * Holds the well open at roughly its loaded height while the tracklist streams
 * in, so the grid below does not jump once it lands. Mirrors the well's gutter
 * and text edge too, so the album name above it does not slide sideways either.
 *
 * `data-role="album-detail-placeholder"` is what the well's height reserve keys
 * off: while this is on screen the well is floored at the height the previous
 * album measured, and its removal is what releases that floor.
 */
export function AlbumDetailBodySkeleton({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const surfaceStyles = ALBUM_DETAIL_SKELETON_SURFACE_STYLES[surface];
  return (
    <Box data-role="album-detail-placeholder" sx={{ display: 'contents' }}>
      <Box data-role="album-meta-skeleton" sx={surfaceStyles.metaRow}>
        <Box sx={surfaceStyles.metaText}>
          <Skeleton sx={{ maxWidth: 320 }} variant="text" width="55%" />
          <Skeleton height={28} sx={{ maxWidth: 380 }} variant="text" width="65%" />
        </Box>
      </Box>
      <Box sx={surfaceStyles.trackList}>
        {PLACEHOLDER_TRACKS.map((track) => (
          <Box
            className={surface === 'collage' ? styles.collageTrackRow : undefined}
            data-role="track-row-skeleton"
            key={track}
            sx={surfaceStyles.row}
          >
            <Skeleton variant="text" />
            <Box sx={{ display: 'grid', rowGap: 0.25 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton height={16} variant="text" width="45%" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
