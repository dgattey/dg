import type { SxObject } from '@dg/ui/theme';
import { Box, Skeleton, Stack } from '@mui/material';
import { albumGridSx, albumTileFrameSx, albumTileSkeletonSx } from './albumTileGeometry';

const headingSx: SxObject = {
  marginBlock: 2,
};

const placeholderSection = (label: string) => ({
  label,
  tiles: Array.from({ length: 12 }, (_, tile) => `${label}-${tile}`),
});

const PLACEHOLDER_SECTIONS = [placeholderSection('recent'), placeholderSection('earlier')];

/**
 * Occupies the same space the loaded grid will, so the sheet does not resize
 * under the view transition when real tracks stream in.
 */
export function MusicHistorySkeleton() {
  return (
    <Stack spacing={3}>
      {PLACEHOLDER_SECTIONS.map((section) => (
        <Stack key={section.label} spacing={1}>
          <Skeleton height={40} sx={headingSx} width={160} />
          <Box sx={albumGridSx}>
            {section.tiles.map((tile) => (
              <Box key={tile} sx={albumTileFrameSx}>
                <Skeleton sx={albumTileSkeletonSx} variant="rectangular" />
              </Box>
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
