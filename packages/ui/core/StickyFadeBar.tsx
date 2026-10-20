import type { SxObject } from '../theme';
import { Box, type BoxProps } from './Box';

const HEADER_HEIGHT = 'var(--site-header-height, 5.5rem)';

const stickyBarSx: SxObject = {
  position: 'sticky',
  top: HEADER_HEIGHT,
  zIndex: 5,
};

type StickyFadeBarProps = Omit<BoxProps, 'sx'> & {
  sx?: SxObject;
};

export function StickyFadeBar({ children, sx, ...props }: StickyFadeBarProps) {
  const mergedSx = sx ? { ...stickyBarSx, ...sx } : stickyBarSx;
  return (
    <Box {...props} sx={mergedSx}>
      {children}
    </Box>
  );
}
