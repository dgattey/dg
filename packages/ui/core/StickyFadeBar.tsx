import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxObject } from '../theme';

/**
 * Soft gradient that trails below a sticky bar so content scrolls under it
 * instead of colliding. Pointer-events stay off so clicks pass through to
 * whatever sits under the fade.
 */
const fadeOverlaySx: SxObject = {
  background:
    'linear-gradient(to bottom, var(--mui-palette-background-default) 0%, color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent) 55%, transparent 100%)',
  bottom: 0,
  height: '2.5rem',
  left: 0,
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  transform: 'translateY(100%)',
  zIndex: 0,
};

const stickyBarSx: SxObject = {
  /* Opaque under the content so scrolling cards don't show through the label. */
  backgroundColor: 'var(--mui-palette-background-default)',
  position: 'sticky',
  /* Sit just under the glass header. Measured once by Header into this var. */
  top: 'var(--site-header-height, 5.5rem)',
  zIndex: 5,
};

const stickyInnerSx: SxObject = {
  position: 'relative',
  zIndex: 1,
};

type StickyFadeBarProps = Omit<BoxProps, 'sx' | 'children'> & {
  children: ReactNode;
  sx?: SxObject;
};

/**
 * Sticky bar with a soft fade beneath it. Content that follows scrolls under
 * the bar rather than colliding with it. Theme-aware via the background CSS
 * variable, so it works in both light and dark schemes.
 */
export function StickyFadeBar({ children, sx, ...props }: StickyFadeBarProps) {
  const mergedSx = sx ? { ...stickyBarSx, ...sx } : stickyBarSx;
  return (
    <Box {...props} sx={mergedSx}>
      <Box sx={stickyInnerSx}>{children}</Box>
      <Box aria-hidden data-sticky-fade sx={fadeOverlaySx} />
    </Box>
  );
}
