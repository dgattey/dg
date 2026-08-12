import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

/**
 * The homepage shell shown while the flag-dependent layout streams in.
 *
 * The layout choice reads a request-time cookie, so with Cache Components the
 * page can't bake either homepage into the prerendered static shell — it needs a
 * Suspense boundary, and whatever that boundary renders is the first paint
 * everyone sees. Rather than leave it blank, this fills the same full-bleed area
 * the world will occupy with a calm terrain wash (ocean edges fading to a
 * sunlit clearing), keyed off the page background so the far more common grid
 * visitor just sees a brief tint of their normal page rather than a flash of a
 * different scene. It carries no data, so it stays fully static and paints
 * instantly.
 */
const fallbackSx: SxObject = {
  '@keyframes homepageShellPulse': {
    '0%, 100%': { opacity: 0.55 },
    '50%': { opacity: 0.9 },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::after': { animation: 'none' },
  },
  '&::after': {
    animation: 'homepageShellPulse 2.4s ease-in-out infinite',
    background:
      'radial-gradient(60% 55% at 50% 42%, light-dark(hsl(96deg 42% 71% / 0.5), hsl(150deg 24% 25% / 0.55)), transparent 70%)',
    content: '""',
    inset: 0,
    position: 'absolute',
  },
  background:
    'radial-gradient(120% 100% at 50% 50%, var(--mui-palette-background-default), light-dark(hsl(196deg 58% 58% / 0.35), hsl(196deg 64% 13% / 0.6)))',
  marginInline: 'calc(50% - 50dvw)',
  minHeight: 'calc(100dvh - var(--site-header-height, 5rem))',
  overflow: 'hidden',
  position: 'relative',
  width: '100dvw',
};

/**
 * Marked JS-only because without scripting this boundary never resolves: React
 * swaps streamed content in with inline scripts, so the wash would sit there
 * forever, a viewport of empty gradient above the `noscript` homepage the page
 * renders for exactly that case.
 */
export function HomepageFallback() {
  return <Box aria-hidden="true" sx={fallbackSx} {...jsOnlyProps} />;
}
