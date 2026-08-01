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

const headingSx: SxObject = {
  marginBlock: 2,
};

const thumbnailSx: SxObject = {
  aspectRatio: '1',
  borderRadius: 2,
  height: 'auto',
  width: '100%',
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
          <Box sx={gridSx}>
            {section.tiles.map((tile) => (
              <Skeleton key={tile} sx={thumbnailSx} variant="rectangular" />
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
