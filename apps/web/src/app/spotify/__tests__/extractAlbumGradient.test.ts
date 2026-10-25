import { contrastRatio, hslToRgb } from '../albumColorMath';
import {
  ALBUM_INK_COLORS,
  type AlbumColors,
  extractAlbumColorsFromImageData,
} from '../extractAlbumGradient';

type Pixel = [number, number, number];

function cover(...groups: Array<{ color: Pixel; count: number }>): Uint8ClampedArray {
  const pixels = groups.flatMap(({ color, count }) => Array<Pixel>(count).fill(color));
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], index) => {
    data.set([r, g, b, 255], index * 4);
  });
  return data;
}

type Stop = { a: number; h: number; l: number; s: number };

function stopsOf(css: string): Array<Stop> {
  return [...css.matchAll(/hsl\(([\d.]+) ([\d.]+)% ([\d.]+)% \/ ([\d.]+)\)/g)].map((match) => ({
    a: Number(match[4]),
    h: Number(match[1]),
    l: Number(match[3]) / 100,
    s: Number(match[2]) / 100,
  }));
}

/** The flat colors text can sit on: the base stops and each glow composited over them. */
function surfacesOf({ mesh }: AlbumColors) {
  const stops = stopsOf(mesh);
  const base = stops.slice(-2).map(hslToRgb);
  const glows = stops.slice(0, -2);
  return [
    ...base,
    ...glows.flatMap((glow) =>
      base.map((under) => {
        const over = hslToRgb(glow);
        const mix = (a: number, b: number) => a * glow.a + b * (1 - glow.a);
        return { b: mix(over.b, under.b), g: mix(over.g, under.g), r: mix(over.r, under.r) };
      }),
    ),
  ];
}

const CREAM: Pixel = [248, 246, 240];

describe('extractAlbumColorsFromImageData', () => {
  it('keeps a mostly white cover white, with only its real accents in two corners', () => {
    const colors = extractAlbumColorsFromImageData(
      cover(
        { color: CREAM, count: 75 },
        { color: [40, 90, 200], count: 15 },
        { color: [60, 160, 70], count: 10 },
      ),
    );
    const stops = stopsOf(colors.mesh);
    const [base] = stops.slice(-1);
    const glows = stops.slice(0, -2);

    expect(colors.ink).toBe('dark');
    expect(base?.l).toBeGreaterThan(0.9);
    expect((base?.s ?? 1) * (1 - Math.abs(2 * (base?.l ?? 0) - 1))).toBeLessThan(0.05);
    expect(glows).toHaveLength(2);
    expect(glows.every((glow) => glow.a < 1)).toBe(true);
  });

  it('keeps a bright cyan cover sky-cyan under dark text instead of sinking it to navy', () => {
    const colors = extractAlbumColorsFromImageData(
      cover({ color: [40, 210, 240], count: 70 }, { color: [40, 110, 230], count: 30 }),
    );
    const [lead] = stopsOf(colors.mesh);

    expect(colors.ink).toBe('dark');
    expect(lead?.h).toBeGreaterThan(180);
    expect(lead?.h).toBeLessThan(200);
    expect(lead?.l).toBeGreaterThan(0.45);
  });

  it('gives a mostly black cover light text', () => {
    const colors = extractAlbumColorsFromImageData(
      cover({ color: [16, 16, 18], count: 80 }, { color: [200, 60, 40], count: 20 }),
    );

    expect(colors.ink).toBe('light');
  });

  it('fills all four corners with distinct hues on a colorful cover', () => {
    const colors = extractAlbumColorsFromImageData(
      cover(
        { color: [220, 50, 50], count: 30 },
        { color: [50, 50, 220], count: 30 },
        { color: [50, 180, 50], count: 20 },
        { color: [200, 200, 50], count: 20 },
      ),
    );
    const glows = stopsOf(colors.mesh).slice(0, -2);

    expect(glows).toHaveLength(4);
    expect(new Set(glows.map((glow) => Math.round(glow.h / 30))).size).toBe(4);
  });

  it.each<[string, Array<{ color: Pixel; count: number }>]>([
    [
      'hot pink and cream',
      [
        { color: [232, 70, 130], count: 55 },
        { color: CREAM, count: 45 },
      ],
    ],
    [
      'deep teal',
      [
        { color: [20, 70, 90], count: 80 },
        { color: [230, 120, 60], count: 20 },
      ],
    ],
    [
      'red room',
      [
        { color: [200, 40, 30], count: 60 },
        { color: [220, 170, 120], count: 40 },
      ],
    ],
    ['mid gray', [{ color: [128, 128, 128], count: 100 }]],
    [
      'yellow and violet',
      [
        { color: [240, 220, 40], count: 50 },
        { color: [90, 40, 160], count: 50 },
      ],
    ],
  ])('clears AA contrast for its text on a %s cover', (_name, groups) => {
    const colors = extractAlbumColorsFromImageData(cover(...groups));
    const ink = ALBUM_INK_COLORS[colors.ink];

    for (const surface of surfacesOf(colors)) {
      expect(contrastRatio(surface, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('layers the text scrim over the same mesh the glow uses', () => {
    const colors = extractAlbumColorsFromImageData(cover({ color: [220, 50, 50], count: 100 }));

    expect(colors.surface.startsWith('linear-gradient(to bottom')).toBe(true);
    expect(colors.surface.endsWith(colors.mesh)).toBe(true);
  });
});
