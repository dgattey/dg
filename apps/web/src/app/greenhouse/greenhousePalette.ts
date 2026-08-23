import type { SxObject } from '@dg/ui/theme';
import { lightDark } from '@dg/ui/theme/color';
import { FONT_DISPLAY_STACK } from '@dg/ui/theme/typography';

/**
 * Token overrides scoped to `GreenhouseFrame`. Type comes from MUI
 * variants via `GreenhouseTypeProvider` — this file only sets glass/card
 * paints and the display stack.
 */
export const GREENHOUSE_TOKEN_VARS: SxObject = {
  '--card-backdrop-filter': 'blur(20px) saturate(1.05)',
  '--card-bg': 'color-mix(in srgb, var(--mui-palette-background-paper) 50%, transparent)',
  '--card-box-shadow':
    'inset 0 1.5px 0 color-mix(in srgb, white 82%, transparent), inset 0 0 0 1px color-mix(in srgb, white 34%, transparent), inset 0 -1px 0 color-mix(in srgb, black 6%, transparent), 0 22px 48px color-mix(in srgb, black 28%, transparent), 0 8px 18px color-mix(in srgb, black 16%, transparent)',
  '--font-display': FONT_DISPLAY_STACK,
  '--glass-backdrop-filter': 'blur(20px) saturate(1.05)',
  '--glass-bg': 'color-mix(in srgb, var(--mui-palette-background-paper) 50%, transparent)',
  '--greenhouse-gutter': '1.25rem',
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
  wash: ['hsl(62deg, 22%, 48%)', 'hsl(158deg, 26%, 9%)'],
} as const;

export const GREENHOUSE_ATMOSPHERE_VARS: SxObject = {
  '--greenhouse-wash': lightDark(atmospherePair.wash),
};

export const GREENHOUSE_FRAME_VARS: SxObject = {
  ...GREENHOUSE_LEAF_VARS,
  ...GREENHOUSE_ATMOSPHERE_VARS,
  ...GREENHOUSE_TOKEN_VARS,
};
