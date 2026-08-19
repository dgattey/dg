import type { SxObject } from '@dg/ui/theme';
import { lightDark } from '@dg/ui/theme/color';
import { GLASS_BG_MATTE } from '@dg/ui/theme/glass';
import { FONT_DISPLAY_STACK, HEADING_FONT_SIZE_DISPLAY } from '@dg/ui/theme/typography';

/**
 * Token overrides scoped to `GreenhouseFrame`. Flag-off `:root` keeps today's
 * sans small-caps headings and frosted glass.
 */
export const GREENHOUSE_TOKEN_VARS: SxObject = {
  '--font-display': FONT_DISPLAY_STACK,
  '--glass-backdrop-filter': 'none',
  '--glass-bg': GLASS_BG_MATTE,
  '--heading-font-size': HEADING_FONT_SIZE_DISPLAY,
  '--heading-font-stretch': 'normal',
  '--heading-font-variant': 'normal',
};

const leafPair = {
  bopBlue: ['hsl(210deg, 48%, 42%)', 'hsl(210deg, 40%, 62%)'],
  bopOrange: ['hsl(24deg, 72%, 48%)', 'hsl(24deg, 70%, 58%)'],
  dark: ['hsl(152deg, 32%, 28%)', 'hsl(152deg, 28%, 42%)'],
  mid: ['hsl(148deg, 38%, 38%)', 'hsl(148deg, 30%, 48%)'],
  variegation: ['hsl(48deg, 55%, 88%)', 'hsl(48deg, 20%, 62%)'],
  veinPink: ['hsl(340deg, 42%, 62%)', 'hsl(340deg, 35%, 68%)'],
  wash: ['hsl(142deg, 40%, 52%)', 'hsl(142deg, 28%, 40%)'],
} as const;

/**
 * Leaf paints. Theme swap is CSS via `light-dark()`, same as brand tokens.
 */
export const GREENHOUSE_LEAF_VARS: SxObject = {
  '--bop-blue': lightDark(leafPair.bopBlue),
  '--bop-orange': lightDark(leafPair.bopOrange),
  '--leaf-dark': lightDark(leafPair.dark),
  '--leaf-mid': lightDark(leafPair.mid),
  '--leaf-variegation': lightDark(leafPair.variegation),
  '--leaf-wash': lightDark(leafPair.wash),
  '--vein-pink': lightDark(leafPair.veinPink),
};

export const GREENHOUSE_FRAME_VARS: SxObject = {
  ...GREENHOUSE_LEAF_VARS,
  ...GREENHOUSE_TOKEN_VARS,
};
