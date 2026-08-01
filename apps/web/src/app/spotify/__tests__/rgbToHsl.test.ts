/**
 * Tests for RGB to HSL conversion using well-documented reference values.
 * Reference sources:
 * - CSS named colors: https://www.w3.org/TR/css-color-4/#named-colors
 * - RapidTables converter: https://www.rapidtables.com/convert/color/rgb-to-hsl.html
 */
import { rgbToHsl } from '../rgbToHsl';

describe('rgbToHsl', () => {
  const roundHsl = (hsl: { h: number; s: number; l: number }) => ({
    h: Math.round(hsl.h),
    l: Math.round(hsl.l * 100),
    s: Math.round(hsl.s * 100),
  });

  describe('primary colors (CSS named colors)', () => {
    it('red: RGB(255, 0, 0) → HSL(0°, 100%, 50%)', () => {
      expect(roundHsl(rgbToHsl({ b: 0, g: 0, r: 255 }))).toEqual({ h: 0, l: 50, s: 100 });
    });

    it('lime (pure green): RGB(0, 255, 0) → HSL(120°, 100%, 50%)', () => {
      expect(roundHsl(rgbToHsl({ b: 0, g: 255, r: 0 }))).toEqual({ h: 120, l: 50, s: 100 });
    });

    it('blue: RGB(0, 0, 255) → HSL(240°, 100%, 50%)', () => {
      expect(roundHsl(rgbToHsl({ b: 255, g: 0, r: 0 }))).toEqual({ h: 240, l: 50, s: 100 });
    });
  });

  describe('grayscale (achromatic)', () => {
    it('white: RGB(255, 255, 255) → HSL(0°, 0%, 100%)', () => {
      expect(roundHsl(rgbToHsl({ b: 255, g: 255, r: 255 }))).toEqual({ h: 0, l: 100, s: 0 });
    });

    it('black: RGB(0, 0, 0) → HSL(0°, 0%, 0%)', () => {
      expect(roundHsl(rgbToHsl({ b: 0, g: 0, r: 0 }))).toEqual({ h: 0, l: 0, s: 0 });
    });
  });

  describe('near-white colors (high lightness, potential saturation issues)', () => {
    it('warm cream: RGB(255, 250, 235) → HSL(45°, 100%, 96%)', () => {
      expect(roundHsl(rgbToHsl({ b: 235, g: 250, r: 255 }))).toEqual({ h: 45, l: 96, s: 100 });
    });
  });
});
