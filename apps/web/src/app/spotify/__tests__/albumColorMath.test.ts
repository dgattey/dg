import { contrastRatio, hslToRgb, rgbToHsl } from '../albumColorMath';

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

  it('round-trips through hslToRgb', () => {
    const rgb = hslToRgb(rgbToHsl({ b: 40, g: 120, r: 200 }));
    expect([rgb.r, rgb.g, rgb.b].map(Math.round)).toEqual([200, 120, 40]);
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG extremes and is symmetric', () => {
    const black = { b: 0, g: 0, r: 0 };
    const white = { b: 255, g: 255, r: 255 };
    expect(contrastRatio(black, white)).toBeCloseTo(21);
    expect(contrastRatio(white, black)).toBeCloseTo(21);
    expect(contrastRatio(white, white)).toBe(1);
  });
});
