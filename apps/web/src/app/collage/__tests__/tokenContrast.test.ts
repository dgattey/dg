const COLLAGE_TEXT_PAIRS = {
  dark: {
    cream: '#efe6d2',
    ink: '#f3ecdc',
    inkOnCream: '#1d1a15',
    olive: '#8d9e46',
    ultramarine: '#3557b8',
    vermilion: '#e05f3a',
  },
  light: {
    cream: '#f7f1e2',
    ink: '#1d1a15',
    inkOnCream: '#1d1a15',
    olive: '#7b8a3a',
    ultramarine: '#2c4db0',
    vermilion: '#d95a36',
  },
} as const;

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex);
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('collage token contrast', () => {
  it.each([
    ['light ink on olive (Strava)', 'light', 'inkOnCream', 'olive'],
    ['dark ink on olive (Strava)', 'dark', 'inkOnCream', 'olive'],
    ['light ink on vermilion (Side projects)', 'light', 'inkOnCream', 'vermilion'],
    ['dark ink on vermilion (Side projects)', 'dark', 'inkOnCream', 'vermilion'],
    ['light ink on cream', 'light', 'ink', 'cream'],
    ['dark cream on ultramarine tags', 'dark', 'cream', 'ultramarine'],
  ] as const)('%s meets WCAG AA', (_label, scheme, foregroundKey, backgroundKey) => {
    const tokens = COLLAGE_TEXT_PAIRS[scheme];
    const ratio = contrastRatio(tokens[foregroundKey], tokens[backgroundKey]);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
