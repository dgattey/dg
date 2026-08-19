import type { SxObject } from '@dg/ui/theme';
import { lightDark } from '@dg/ui/theme/color';
import { GLASS_BG_MATTE } from '@dg/ui/theme/glass';
import { FONT_DISPLAY_STACK, HEADING_FONT_SIZE_DISPLAY } from '@dg/ui/theme/typography';

/**
 * Token overrides scoped to `GreenhouseFrame`. Flag-off `:root` keeps today's
 * sans small-caps headings and frosted glass.
 */
export const GREENHOUSE_TOKEN_VARS: SxObject = {
  '--card-backdrop-filter': 'none',
  '--card-bg': GLASS_BG_MATTE,
  '--font-display': FONT_DISPLAY_STACK,
  '--glass-backdrop-filter': 'none',
  '--glass-bg': GLASS_BG_MATTE,
  '--heading-font-size': HEADING_FONT_SIZE_DISPLAY,
  '--heading-font-stretch': 'normal',
  '--heading-font-variant': 'normal',
};

const leafPair = {
  bopBlue: ['hsl(210deg, 48%, 42%)', 'hsl(210deg, 40%, 62%)'],
  bopOrange: ['hsl(24deg, 78%, 48%)', 'hsl(24deg, 72%, 58%)'],
  dark: ['hsl(152deg, 42%, 22%)', 'hsl(152deg, 32%, 38%)'],
  mid: ['hsl(146deg, 44%, 30%)', 'hsl(146deg, 32%, 44%)'],
  shadow: ['hsl(155deg, 38%, 14%)', 'hsl(155deg, 24%, 22%)'],
  shine: ['hsl(88deg, 42%, 72%)', 'hsl(88deg, 22%, 48%)'],
  variegation: ['hsl(48deg, 58%, 88%)', 'hsl(48deg, 22%, 62%)'],
  veinPink: ['hsl(340deg, 48%, 58%)', 'hsl(340deg, 38%, 68%)'],
  wash: ['hsl(136deg, 42%, 40%)', 'hsl(136deg, 28%, 38%)'],
} as const;

/**
 * Leaf paints. Theme swap is CSS via `light-dark()`, same as brand tokens.
 */
export const GREENHOUSE_LEAF_VARS: SxObject = {
  '--bop-blue': lightDark(leafPair.bopBlue),
  '--bop-orange': lightDark(leafPair.bopOrange),
  '--leaf-dark': lightDark(leafPair.dark),
  '--leaf-mid': lightDark(leafPair.mid),
  '--leaf-shadow': lightDark(leafPair.shadow),
  '--leaf-shine': lightDark(leafPair.shine),
  '--leaf-variegation': lightDark(leafPair.variegation),
  '--leaf-wash': lightDark(leafPair.wash),
  '--vein-pink': lightDark(leafPair.veinPink),
};

const atmospherePair = {
  mullion: ['hsl(28deg, 18%, 22%)', 'hsl(0deg, 0%, 82%)'],
  mullionEdge: ['hsl(40deg, 30%, 78%, 0.4)', 'hsl(0deg, 0%, 100%, 0.14)'],
  ribDark: ['hsl(95deg, 18%, 28%, 0.42)', 'hsl(160deg, 10%, 80%, 0.18)'],
  ribMid: ['hsl(88deg, 28%, 72%, 0.28)', 'hsl(160deg, 16%, 22%, 0.24)'],
  ribShine: ['hsl(48deg, 55%, 90%, 0.28)', 'hsl(40deg, 20%, 32%, 0.16)'],
  sunCore: ['hsl(48deg, 100%, 94%, 0.95)', 'hsl(40deg, 80%, 58%, 0.55)'],
  sunHalo: ['hsl(42deg, 90%, 80%, 0.5)', 'hsl(38deg, 60%, 40%, 0.28)'],
  wash: ['hsl(95deg, 24%, 58%)', 'hsl(160deg, 28%, 9%)'],
} as const;

export const GREENHOUSE_ATMOSPHERE_VARS: SxObject = {
  '--greenhouse-mullion': lightDark(atmospherePair.mullion),
  '--greenhouse-mullion-edge': lightDark(atmospherePair.mullionEdge),
  '--greenhouse-rib-dark': lightDark(atmospherePair.ribDark),
  '--greenhouse-rib-mid': lightDark(atmospherePair.ribMid),
  '--greenhouse-rib-shine': lightDark(atmospherePair.ribShine),
  '--greenhouse-sun-core': lightDark(atmospherePair.sunCore),
  '--greenhouse-sun-halo': lightDark(atmospherePair.sunHalo),
  '--greenhouse-wash': lightDark(atmospherePair.wash),
};

export const GREENHOUSE_FRAME_VARS: SxObject = {
  ...GREENHOUSE_LEAF_VARS,
  ...GREENHOUSE_ATMOSPHERE_VARS,
  ...GREENHOUSE_TOKEN_VARS,
};
