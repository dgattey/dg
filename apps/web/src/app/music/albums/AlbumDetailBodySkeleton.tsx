import { Box } from '@dg/ui/core/Box';
import { Skeleton } from '@dg/ui/core/Skeleton';
import type { SxObject } from '@dg/ui/theme';

const ALBUM_WELL_TRACK_NUMBER_COLUMN = '1.5rem';
const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);

const collageMetaRowSx: SxObject = { gridArea: 'meta', mt: '10px' };
const collageMetaTextSx: SxObject = { display: 'grid', minWidth: 0, rowGap: '6px' };
const collageRowSx: SxObject = {
  borderBottom: '1px solid color-mix(in oklab, var(--on) 28%, var(--pc))',
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
 * in, so the grid below does not jump once it lands.
 *
 * `data-role="album-detail-placeholder"` is what the well's height reserve keys
 * off: while this is on screen the well is floored at the height the previous
 * album measured, and its removal is what releases that floor.
 */
export function AlbumDetailBodySkeleton() {
  return (
    <Box data-role="album-detail-placeholder" sx={{ display: 'contents' }}>
      <Box data-role="album-meta-skeleton" sx={collageMetaRowSx}>
        <Box sx={collageMetaTextSx}>
          <Skeleton sx={{ maxWidth: 320 }} variant="text" width="55%" />
          <Skeleton height={28} sx={{ maxWidth: 380 }} variant="text" width="65%" />
        </Box>
      </Box>
      <Box sx={collageTrackListSx}>
        {PLACEHOLDER_TRACKS.map((track) => (
          <Box data-role="track-row-skeleton" key={track} sx={collageRowSx}>
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
