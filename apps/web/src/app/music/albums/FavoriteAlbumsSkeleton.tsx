import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';

const gridSx: SxObject = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: 'repeat(6, 1fr)',
    md: 'repeat(4, 1fr)',
    sm: 'repeat(3, 1fr)',
    xs: 'repeat(2, 1fr)',
  },
};

const sortSwitcherSx: SxObject = {
  borderRadius: 999,
  height: 52,
  maxWidth: 420,
  width: '100%',
};

const thumbnailSx: SxObject = {
  aspectRatio: '1',
  borderRadius: 2,
  height: 'auto',
  width: '100%',
};

const PLACEHOLDER_TILES = Array.from({ length: 12 }, (_, tile) => `album-${tile}`);

/**
 * Occupies the same space the loaded grid will, so the sheet does not resize
 * under the view transition when albums stream in.
 */
export function FavoriteAlbumsSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton sx={sortSwitcherSx} variant="rectangular" />
      <Box sx={gridSx}>
        {PLACEHOLDER_TILES.map((tile) => (
          <Skeleton key={tile} sx={thumbnailSx} variant="rectangular" />
        ))}
      </Box>
    </Stack>
  );
}
