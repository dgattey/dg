export type SchemePair = readonly [light: string, dark: string];

export type SchemeColor =
  | `light-dark(${string})`
  | `color-mix(in srgb, ${'Canvas' | 'CanvasText'} ${string})`;

export const BRAND_PAIRS = {
  cardBorder: ['hsl(24deg, 10%, 50%, 0.25)', 'hsl(183deg, 10%, 50%, 0.25)'],
  defaultBackground: ['hsl(24deg, 48%, 90%, 1)', 'hsl(183deg, 92%, 10%, 1)'],
  error: ['#d32f2f', '#f44336'],
  errorContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  errorDark: ['#c62828', '#d32f2f'],
  errorLight: ['#ef5350', '#e57373'],
  h1: ['hsl(183deg, 33%, 37%, 1)', 'hsl(24deg, 58%, 70%, 1)'],
  h2: ['hsl(183deg, 31%, 35%, 1)', 'hsl(24deg, 38%, 70%, 1)'],
  h3: ['hsl(183deg, 29%, 32%, 1)', 'hsl(24deg, 28%, 70%, 1)'],
  h4: ['hsl(183deg, 27%, 29%, 1)', 'hsl(24deg, 28%, 70%, 1)'],
  h5: ['hsl(183deg, 25%, 27%, 1)', 'hsl(24deg, 18%, 82%, 1)'],
  h6: ['hsl(183deg, 23%, 20%, 1)', 'hsl(24deg, 18%, 82%, 1)'],
  info: ['#0288d1', '#29b6f6'],
  infoContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  infoDark: ['#01579b', '#0288d1'],
  infoLight: ['#03a9f4', '#4fc3f7'],
  mutedText: ['hsl(183deg, 12%, 48%, 1)', 'hsl(24deg, 1%, 47%, 1)'],
  paperBackground: ['hsl(24deg, 52%, 94%, 1)', 'hsl(183deg, 90%, 14%, 1)'],
  primary: ['hsl(183deg, 33%, 39%, 1)', 'hsl(24deg, 88%, 70%, 1)'],
  primaryContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  primaryDark: ['hsl(183, 33%, 27.3%, 1)', 'hsl(24, 88%, 49%, 1)'],
  primaryLight: ['hsl(183, 33%, 51.2%, 1)', 'hsl(24, 88%, 76%, 1)'],
  secondary: ['hsl(183deg, 33%, 39%, 0.75)', 'hsl(24deg, 88%, 70%, 0.75)'],
  secondaryContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  secondaryDark: ['hsl(183, 33%, 27.3%, 0.75)', 'hsl(24, 88%, 49%, 0.75)'],
  secondaryLight: ['hsl(183, 33%, 51.2%, 0.75)', 'hsl(24, 88%, 76%, 0.75)'],
  secondaryShadow: ['hsl(183deg, 33%, 5.46%, 0.4)', 'hsl(24deg, 88%, 9.8%, 0.4)'],
  success: ['#2e7d32', '#66bb6a'],
  successContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  successDark: ['#1b5e20', '#388e3c'],
  successLight: ['#4caf50', '#81c784'],
  text: ['hsl(183deg, 12%, 27%, 1)', 'hsl(24deg, 1%, 79%, 1)'],
  warning: ['#ed6c02', '#ffa726'],
  warningContrastText: ['#fff', 'rgba(0, 0, 0, 0.87)'],
  warningDark: ['#e65100', '#f57c00'],
  warningLight: ['#ff9800', '#ffb74d'],
} as const satisfies Record<string, SchemePair>;

const lightDark = ([light, dark]: SchemePair): SchemeColor => `light-dark(${light}, ${dark})`;

export const BRAND = Object.fromEntries(
  Object.entries(BRAND_PAIRS).map(([key, pair]) => [key, lightDark(pair)]),
) as { readonly [K in keyof typeof BRAND_PAIRS]: SchemeColor };

export const onCanvas = (percent: number): SchemeColor =>
  `color-mix(in srgb, CanvasText ${percent}%, transparent)`;
