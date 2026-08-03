import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxObject } from '../theme';

const BACKGROUND = 'var(--mui-palette-background-default)';

/** Measured once by the header, so the bar tracks it across breakpoints. */
const HEADER_HEIGHT = 'var(--site-header-height, 5.5rem)';

const scrim = (percent: number) => `color-mix(in srgb, ${BACKGROUND} ${percent}%, transparent)`;

/**
 * Stretches a bar-anchored layer from window edge to window edge. Bars live
 * inside the page's centred container, so a layer that inherits the bar's own
 * width leaves the strips beside it bare and cards scroll past in plain sight
 * there. `html` clips overflow on this axis, so the extra width can't add a
 * horizontal scrollbar even when a classic scrollbar reserves a gutter.
 */
const fullBleed = {
  insetInlineStart: '50%',
  marginInlineStart: '-50vw',
  width: '100vw',
} as const;

/**
 * Covers the strip between the top of the viewport and the pinned bar, so
 * content scrolling up vanishes behind the header instead of showing through
 * the gap above the bar.
 *
 * Fixed rather than absolute: an unpinned bar sits mid-page, and only the
 * viewport-anchored strip should ever be covered. Opaque all the way through,
 * so a page with several bars paints the same pixels once instead of stacking
 * translucent copies.
 */
const viewportMaskSx: SxObject = {
  backgroundColor: BACKGROUND,
  /* Overlap the bar by a pixel so no seam shows between the two surfaces. */
  height: `calc(${HEADER_HEIGHT} + 1px)`,
  insetInline: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  zIndex: 0,
};

/**
 * Opaque under the content so scrolling cards don't show through the label,
 * and out to the window edges so they don't show up beside it either.
 */
const barSurfaceSx: SxObject = {
  ...fullBleed,
  backgroundColor: BACKGROUND,
  bottom: 0,
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  zIndex: 0,
};

/** Long enough that the ramp reads as a dissolve rather than an edge. */
const FADE_HEIGHT = '3rem';

/**
 * Trails below the bar so content dissolves as it scrolls under. Alpha follows
 * a smoothstep curve rather than a straight line, so neither end forms a knee:
 * a short or linear ramp reads as a band because perceived luminance doesn't
 * fall off linearly with alpha.
 */
const fadeOverlaySx: SxObject = {
  ...fullBleed,
  background: `linear-gradient(to bottom, ${BACKGROUND} 0%, ${scrim(94)} 15%, ${scrim(78)} 30%, ${scrim(57)} 45%, ${scrim(35)} 60%, ${scrim(16)} 75%, ${scrim(4)} 88%, transparent 100%)`,
  bottom: `calc(-1 * ${FADE_HEIGHT})`,
  height: FADE_HEIGHT,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
};

const stickyBarSx: SxObject = {
  position: 'sticky',
  /* Sit just under the glass header, which the mask above covers. */
  top: HEADER_HEIGHT,
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
 * Sticky bar with a soft fade beneath it and a mask over the strip above it,
 * so content scrolls out of sight rather than colliding with the bar or
 * peeking between it and the top of the window. Theme-aware via the background
 * CSS variable, so it works in both light and dark schemes.
 */
export function StickyFadeBar({ children, sx, ...props }: StickyFadeBarProps) {
  const mergedSx = sx ? { ...stickyBarSx, ...sx } : stickyBarSx;
  return (
    <Box {...props} sx={mergedSx}>
      <Box aria-hidden data-sticky-mask sx={viewportMaskSx} />
      <Box aria-hidden data-sticky-surface sx={barSurfaceSx} />
      <Box sx={stickyInnerSx}>{children}</Box>
      <Box aria-hidden data-sticky-fade sx={fadeOverlaySx} />
    </Box>
  );
}
