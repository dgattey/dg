import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxObject } from '../theme';
import { stickyDecorSx } from './transitions/pageTransitions';

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
 * Covers the strip between the top of the window and a pinned bar, so content
 * scrolling up vanishes behind the header instead of showing through the gap
 * above the bar.
 *
 * Fixed rather than absolute: an unpinned bar sits mid-page, and only the
 * window-anchored strip should ever be covered. Over page content but under the
 * bars themselves, which overlap it by a pixel.
 *
 * Dormant until a page actually pins a bar. It renders in the app shell so that
 * a navigation can't sweep it along with the page, and an opaque strip on a page
 * with nothing to hide would only leave the header glass with nothing to blur.
 */
const topMaskSx: SxObject = {
  backgroundColor: BACKGROUND,
  'body:has([data-sticky-fade]) &': {
    display: 'block',
  },
  display: 'none',
  /* Overlap the bar by a pixel so no seam shows between the two surfaces. */
  height: `calc(${HEADER_HEIGHT} + 1px)`,
  insetInline: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  zIndex: 4,
  ...stickyDecorSx,
};

/**
 * Opaque under the content so scrolling cards don't show through the label,
 * and out to the window edges so they don't show up beside it either.
 */
const barSurfaceSx: SxObject = {
  ...fullBleed,
  ...stickyDecorSx,
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
  ...stickyDecorSx,
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
 * Sticky bar with a soft fade beneath it, so content dissolves as it scrolls
 * under rather than colliding with the bar. Theme-aware via the background CSS
 * variable, so it works in both light and dark schemes. The strip above the
 * pinned bar is covered by `StickyBarTopMask`, which the app shell renders.
 */
export function StickyFadeBar({ children, sx, ...props }: StickyFadeBarProps) {
  const mergedSx = sx ? { ...stickyBarSx, ...sx } : stickyBarSx;
  return (
    <Box {...props} sx={mergedSx}>
      <Box aria-hidden data-sticky-surface sx={barSurfaceSx} />
      <Box sx={stickyInnerSx}>{children}</Box>
      <Box aria-hidden data-sticky-fade sx={fadeOverlaySx} />
    </Box>
  );
}

/**
 * Hides whatever scrolls between the top of the window and a pinned
 * `StickyFadeBar`. Belongs in the app shell rather than beside each bar: copies
 * would paint the same pixels, and a layer that lives in the page rides that
 * page wherever a navigation takes it.
 */
export function StickyBarTopMask() {
  return <Box aria-hidden data-sticky-mask sx={topMaskSx} />;
}
