import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton } from '@mui/material';
import {
  ALBUM_WELL_TRACK_COLUMN_GAP,
  ALBUM_WELL_TRACK_NUMBER_COLUMN,
  albumWellMetaRowSx,
  albumWellMetaTextSx,
} from './albumWellStyles';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);

const rowSx: SxObject = {
  columnGap: ALBUM_WELL_TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
  py: 1,
};

const collageMetaRowSx: SxObject = { gridArea: 'meta', mt: '10px' };
const collageMetaTextSx: SxObject = { display: 'grid', minWidth: 0, rowGap: '6px' };
const collageRowSx: SxObject = {
  borderBottom: '1px solid color-mix(in oklab, var(--cream) 28%, var(--viridian))',
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

/**
 * Holds the well open at roughly its loaded height while the tracklist streams
 * in. `data-role="album-detail-placeholder"` floors the well at the prior height.
 */
export function AlbumDetailBodySkeleton({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const collage = surface === 'collage';
  return (
    <Box data-role="album-detail-placeholder" sx={{ display: 'contents' }}>
      <Box data-role="album-meta-skeleton" sx={collage ? collageMetaRowSx : albumWellMetaRowSx}>
        <Box sx={collage ? collageMetaTextSx : albumWellMetaTextSx}>
          <Skeleton sx={{ maxWidth: 320 }} variant="text" width="55%" />
          <Skeleton height={28} sx={{ maxWidth: 380 }} variant="text" width="65%" />
        </Box>
      </Box>
      <Box sx={collage ? collageTrackListSx : { display: 'grid', gap: 0.5, gridArea: 'tracks' }}>
        {PLACEHOLDER_TRACKS.map((track) => (
          <Box data-role="track-row-skeleton" key={track} sx={collage ? collageRowSx : rowSx}>
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
