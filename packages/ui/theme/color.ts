type SchemePair = readonly [light: string, dark: string];

type SchemeColor =
  | `light-dark(${string})`
  | `color-mix(in srgb, ${'Canvas' | 'CanvasText'} ${string})`;

const BRAND_PAIRS = {
  cardBorder: ['hsl(24deg, 10%, 50%, 0.25)', 'hsl(183deg, 10%, 50%, 0.25)'],
  defaultBackground: ['hsl(24deg, 48%, 90%, 1)', 'hsl(183deg, 92%, 10%, 1)'],
  h1: ['hsl(183deg, 33%, 37%, 1)', 'hsl(24deg, 58%, 70%, 1)'],
  h2: ['hsl(183deg, 31%, 35%, 1)', 'hsl(24deg, 38%, 70%, 1)'],
  h3: ['hsl(183deg, 29%, 32%, 1)', 'hsl(24deg, 28%, 70%, 1)'],
  h4: ['hsl(183deg, 27%, 29%, 1)', 'hsl(24deg, 28%, 70%, 1)'],
  h5: ['hsl(183deg, 25%, 27%, 1)', 'hsl(24deg, 18%, 82%, 1)'],
  h6: ['hsl(183deg, 23%, 20%, 1)', 'hsl(24deg, 18%, 82%, 1)'],
  mutedText: ['hsl(183deg, 12%, 48%, 1)', 'hsl(24deg, 1%, 47%, 1)'],
  paperBackground: ['hsl(24deg, 52%, 94%, 1)', 'hsl(183deg, 90%, 14%, 1)'],
  text: ['hsl(183deg, 12%, 27%, 1)', 'hsl(24deg, 1%, 79%, 1)'],
} as const satisfies Record<string, SchemePair>;

const lightDark = ([light, dark]: SchemePair): SchemeColor => `light-dark(${light}, ${dark})`;

export const BRAND = Object.fromEntries(
  Object.entries(BRAND_PAIRS).map(([key, pair]) => [key, lightDark(pair)]),
) as { readonly [K in keyof typeof BRAND_PAIRS]: SchemeColor };

export const onCanvas = (percent: number): SchemeColor =>
  `color-mix(in srgb, CanvasText ${percent}%, transparent)`;
