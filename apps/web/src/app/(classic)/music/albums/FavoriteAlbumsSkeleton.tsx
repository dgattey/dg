import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';
import {
  ALBUM_GRID_COLUMNS,
  albumGridSx,
  albumTileFrameSx,
  albumTileSkeletonSx,
} from '../albumTileGeometry';

const sortSwitcherSx: SxObject = {
  borderRadius: 999,
  height: 52,
  maxWidth: 420,
  width: '100%',
};

const DEFAULT_PLACEHOLDER_COUNT = 12;

/**
 * One box the same height as `tileCount` square cells plus gaps, without
 * mounting a node per tile. Used while a view transition photographs the page.
 */
function albumGridReserveSx(tileCount: number): SxObject {
  const rows = (columns: number) => Math.ceil(tileCount / columns);
  const reserve = (columns: number, gapSum: string) => {
    const rowCount = rows(columns);
    return `calc(${(rowCount / columns) * 100}% + ${gapSum})`;
  };

  return {
    paddingBottom: (theme) => {
      const gapSum = (columns: number) => theme.spacing(2 * Math.max(0, rows(columns) - 1));
      return {
        lg: reserve(ALBUM_GRID_COLUMNS.lg, gapSum(ALBUM_GRID_COLUMNS.lg)),
        md: reserve(ALBUM_GRID_COLUMNS.md, gapSum(ALBUM_GRID_COLUMNS.md)),
        sm: reserve(ALBUM_GRID_COLUMNS.sm, gapSum(ALBUM_GRID_COLUMNS.sm)),
        xs: reserve(ALBUM_GRID_COLUMNS.xs, gapSum(ALBUM_GRID_COLUMNS.xs)),
      };
    },
  };
}

/**
 * Occupies the same space the loaded grid will, so the page does not resize
 * under the view transition when albums stream in. Pass `tileCount` when the
 * real length is already known so the opening snapshot matches the grid height.
 * `reserveOnly` keeps that height without compositing a tile per album.
 */
export function FavoriteAlbumsSkeleton({
  reserveOnly = false,
  tileCount = DEFAULT_PLACEHOLDER_COUNT,
}: {
  reserveOnly?: boolean;
  tileCount?: number;
}) {
  if (reserveOnly) {
    return (
      <Stack spacing={2}>
        <Skeleton sx={sortSwitcherSx} variant="rectangular" />
        <Box sx={albumGridReserveSx(tileCount)} />
      </Stack>
    );
  }

  const tiles = Array.from({ length: tileCount }, (_, tile) => `album-${tile}`);
  return (
    <Stack spacing={2}>
      <Skeleton sx={sortSwitcherSx} variant="rectangular" />
      <Box sx={albumGridSx}>
        {tiles.map((tile) => (
          <Box key={tile} sx={albumTileFrameSx}>
            <Skeleton sx={albumTileSkeletonSx} variant="rectangular" />
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
