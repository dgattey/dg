import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton } from '@mui/material';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);
const TRACK_NUMBER_COLUMN = '1.5rem';
const TRACK_COLUMN_GAP = 1.5;

const metaBandSx: SxObject = {
  backgroundColor:
    'color-mix(in srgb, var(--mui-palette-background-paper) 88%, var(--mui-palette-background-default))',
  columnGap: TRACK_COLUMN_GAP,
  display: 'grid',
  gridArea: 'meta',
  gridTemplateColumns: `${TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
  pb: 2,
  position: 'sticky',
  top: {
    sm: 'calc(var(--site-header-height, 5.5rem) + 159px)',
    xs: 'calc(var(--site-header-height, 5.5rem) + 298px)',
  },
  zIndex: 2,
};

const rowSx: SxObject = {
  columnGap: TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
  py: 1,
};

/**
 * Holds the well open at roughly its loaded height while the tracklist streams
 * in, so the grid below does not jump once it lands. Mirrors the well's gutter
 * and text edge too, so the album name above it does not slide sideways either.
 */
export function AlbumDetailBodySkeleton() {
  return (
    <Box sx={{ display: 'contents' }}>
      <Box data-role="album-meta-skeleton" sx={metaBandSx}>
        <Box sx={{ display: 'grid', gridColumn: 2, rowGap: 0.75 }}>
          <Skeleton sx={{ maxWidth: 320 }} variant="text" width="55%" />
          <Skeleton height={28} sx={{ maxWidth: 380 }} variant="text" width="65%" />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gap: 0.5, gridArea: 'tracks' }}>
        {PLACEHOLDER_TRACKS.map((track) => (
          <Box data-role="track-row-skeleton" key={track} sx={rowSx}>
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
