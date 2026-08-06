import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';
import { albumGridSx, albumTileFrameSx, albumTileSkeletonSx } from '../albumTileGeometry';

const sortSwitcherSx: SxObject = {
  borderRadius: 999,
  height: 52,
  maxWidth: 420,
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
      <Box sx={albumGridSx}>
        {PLACEHOLDER_TILES.map((tile) => (
          <Box key={tile} sx={albumTileFrameSx}>
            <Skeleton sx={albumTileSkeletonSx} variant="rectangular" />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
