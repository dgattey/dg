import { extractAlbumGradientFromImageData, rgbToHsl } from '../extractAlbumGradient';

describe('rgbToHsl', () => {
  const roundHsl = (hsl: { h: number; s: number; l: number }) => ({
    h: Math.round(hsl.h),
    l: Math.round(hsl.l * 100),
    s: Math.round(hsl.s * 100),
  });

  it('converts primary, grayscale, and near-white RGB values to HSL', () => {
    expect(roundHsl(rgbToHsl({ b: 0, g: 0, r: 255 }))).toEqual({ h: 0, l: 50, s: 100 });
    expect(roundHsl(rgbToHsl({ b: 0, g: 255, r: 0 }))).toEqual({ h: 120, l: 50, s: 100 });
    expect(roundHsl(rgbToHsl({ b: 255, g: 0, r: 0 }))).toEqual({ h: 240, l: 50, s: 100 });
    expect(roundHsl(rgbToHsl({ b: 255, g: 255, r: 255 }))).toEqual({ h: 0, l: 100, s: 0 });
    expect(roundHsl(rgbToHsl({ b: 0, g: 0, r: 0 }))).toEqual({ h: 0, l: 0, s: 0 });
    expect(roundHsl(rgbToHsl({ b: 235, g: 250, r: 255 }))).toEqual({ h: 45, l: 96, s: 100 });
  });
});

function createRgbaPixels(pixels: Array<[number, number, number]>): Uint8ClampedArray {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  return data;
}

function createUniformPixels(
  r: number,
  g: number,
  b: number,
  count: number,
): Array<[number, number, number]> {
  return Array(count).fill([r, g, b]) as Array<[number, number, number]>;
}

function mixPixels(
  ...groups: Array<{ color: [number, number, number]; count: number }>
): Array<[number, number, number]> {
  return groups.flatMap(({ color, count }) => Array(count).fill(color)) as Array<
    [number, number, number]
  >;
}

describe('extractAlbumGradientFromImageData', () => {
  it('extracts dark gray gradient from mostly black image', () => {
    const result = extractAlbumGradientFromImageData(
      createRgbaPixels(createUniformPixels(20, 20, 20, 100)),
    );
    expect(result.backgroundGradient).not.toBeNull();
    expect(result.contrastSetting).toBe('dark');
    expect(result.backgroundGradient).toContain('radial-gradient(circle at top right');
  });

  it('keeps cream saturations muted for Rumours-like art', () => {
    const result = extractAlbumGradientFromImageData(
      createRgbaPixels(
        mixPixels({ color: [20, 20, 20], count: 60 }, { color: [255, 250, 235], count: 40 }),
      ),
    );
    expect(result.backgroundGradient).not.toBeNull();
    const saturations = [
      ...(result.backgroundGradient?.matchAll(/hsla\([^,]+,\s*([\d.]+)%/g) ?? []),
    ].map((m) => parseFloat(m[1] ?? '0'));
    saturations.forEach((sat) => {
      expect(sat).toBeLessThan(30);
    });
  });

  it('prefers mid-tone vibrant red over cream when mixed', () => {
    const result = extractAlbumGradientFromImageData(
      createRgbaPixels(
        mixPixels({ color: [220, 50, 50], count: 40 }, { color: [255, 250, 235], count: 60 }),
      ),
    );
    const hueMatch = result.backgroundGradient?.match(/hsla\(([\d.]+),/);
    const hue = hueMatch?.[1] ? parseFloat(hueMatch[1]) : -1;
    const isRed = hue < 30 || hue > 330;
    expect(isRed).toBe(true);
  });

  it('extracts multiple colors from colorful image', () => {
    const result = extractAlbumGradientFromImageData(
      createRgbaPixels(
        mixPixels(
          { color: [220, 50, 50], count: 30 },
          { color: [50, 50, 220], count: 30 },
          { color: [50, 180, 50], count: 20 },
          { color: [200, 200, 50], count: 20 },
        ),
      ),
    );
    expect(result.backgroundGradient).not.toBeNull();
    expect(result.backgroundGradient?.split('radial-gradient').length).toBeGreaterThan(3);
  });
});
