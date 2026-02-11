/**
 * Tests for RGB to HSL conversion using well-documented reference values.
 * Reference sources:
 * - CSS named colors: https://www.w3.org/TR/css-color-4/#named-colors
 * - RapidTables converter: https://www.rapidtables.com/convert/color/rgb-to-hsl.html
 * - Wikipedia HSL article: https://en.wikipedia.org/wiki/HSL_and_HSV
 */
import { rgbToHsl } from '../colorConversion';

describe('rgbToHsl', () => {
  // Helper to round for comparison (HSL values can have floating point differences)
  const roundHsl = (hsl: { h: number; s: number; l: number }) => ({
    h: Math.round(hsl.h),
    l: Math.round(hsl.l * 100),
    s: Math.round(hsl.s * 100), // Convert to percentage for readability
  });

  describe('primary colors (CSS named colors)', () => {
    it('red: RGB(255, 0, 0) → HSL(0°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 0, r: 255 }));
      expect(result).toEqual({ h: 0, l: 50, s: 100 });
    });

    it('lime (pure green): RGB(0, 255, 0) → HSL(120°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 255, r: 0 }));
      expect(result).toEqual({ h: 120, l: 50, s: 100 });
    });

    it('blue: RGB(0, 0, 255) → HSL(240°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 255, g: 0, r: 0 }));
      expect(result).toEqual({ h: 240, l: 50, s: 100 });
    });
  });

  describe('secondary colors (CSS named colors)', () => {
    it('yellow: RGB(255, 255, 0) → HSL(60°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 255, r: 255 }));
      expect(result).toEqual({ h: 60, l: 50, s: 100 });
    });

    it('cyan/aqua: RGB(0, 255, 255) → HSL(180°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 255, g: 255, r: 0 }));
      expect(result).toEqual({ h: 180, l: 50, s: 100 });
    });

    it('magenta/fuchsia: RGB(255, 0, 255) → HSL(300°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 255, g: 0, r: 255 }));
      expect(result).toEqual({ h: 300, l: 50, s: 100 });
    });
  });

  describe('grayscale (achromatic)', () => {
    it('white: RGB(255, 255, 255) → HSL(0°, 0%, 100%)', () => {
      const result = roundHsl(rgbToHsl({ b: 255, g: 255, r: 255 }));
      expect(result).toEqual({ h: 0, l: 100, s: 0 });
    });

    it('black: RGB(0, 0, 0) → HSL(0°, 0%, 0%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 0, r: 0 }));
      expect(result).toEqual({ h: 0, l: 0, s: 0 });
    });

    it('gray: RGB(128, 128, 128) → HSL(0°, 0%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 128, g: 128, r: 128 }));
      expect(result).toEqual({ h: 0, l: 50, s: 0 });
    });

    it('silver: RGB(192, 192, 192) → HSL(0°, 0%, 75%)', () => {
      const result = roundHsl(rgbToHsl({ b: 192, g: 192, r: 192 }));
      expect(result).toEqual({ h: 0, l: 75, s: 0 });
    });
  });

  describe('CSS named colors (reference values)', () => {
    // Values from https://www.w3.org/TR/css-color-4/#named-colors
    it('maroon: RGB(128, 0, 0) → HSL(0°, 100%, 25%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 0, r: 128 }));
      expect(result).toEqual({ h: 0, l: 25, s: 100 });
    });

    it('olive: RGB(128, 128, 0) → HSL(60°, 100%, 25%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 128, r: 128 }));
      expect(result).toEqual({ h: 60, l: 25, s: 100 });
    });

    it('teal: RGB(0, 128, 128) → HSL(180°, 100%, 25%)', () => {
      const result = roundHsl(rgbToHsl({ b: 128, g: 128, r: 0 }));
      expect(result).toEqual({ h: 180, l: 25, s: 100 });
    });

    it('navy: RGB(0, 0, 128) → HSL(240°, 100%, 25%)', () => {
      const result = roundHsl(rgbToHsl({ b: 128, g: 0, r: 0 }));
      expect(result).toEqual({ h: 240, l: 25, s: 100 });
    });

    it('purple: RGB(128, 0, 128) → HSL(300°, 100%, 25%)', () => {
      const result = roundHsl(rgbToHsl({ b: 128, g: 0, r: 128 }));
      expect(result).toEqual({ h: 300, l: 25, s: 100 });
    });

    it('orange: RGB(255, 165, 0) → HSL(39°, 100%, 50%)', () => {
      const result = roundHsl(rgbToHsl({ b: 0, g: 165, r: 255 }));
      expect(result).toEqual({ h: 39, l: 50, s: 100 });
    });
  });

  describe('complex colors with mixed saturation/lightness', () => {
    // Verified with https://www.rapidtables.com/convert/color/rgb-to-hsl.html
    it('coral: RGB(255, 127, 80) → HSL(16°, 100%, 66%)', () => {
      const result = roundHsl(rgbToHsl({ b: 80, g: 127, r: 255 }));
      expect(result).toEqual({ h: 16, l: 66, s: 100 });
    });

    it('steel blue: RGB(70, 130, 180) → HSL(207°, 44%, 49%)', () => {
      const result = roundHsl(rgbToHsl({ b: 180, g: 130, r: 70 }));
      expect(result).toEqual({ h: 207, l: 49, s: 44 });
    });

    it('dark olive green: RGB(85, 107, 47) → HSL(82°, 39%, 30%)', () => {
      const result = roundHsl(rgbToHsl({ b: 47, g: 107, r: 85 }));
      expect(result).toEqual({ h: 82, l: 30, s: 39 });
    });

    it('hot pink: RGB(255, 105, 180) → HSL(330°, 100%, 71%)', () => {
      const result = roundHsl(rgbToHsl({ b: 180, g: 105, r: 255 }));
      expect(result).toEqual({ h: 330, l: 71, s: 100 });
    });
  });

  describe('near-white colors (high lightness, potential saturation issues)', () => {
    // These are the problematic cases - cream colors with high mathematical saturation
    // Verified with https://www.rapidtables.com/convert/color/rgb-to-hsl.html

    it('ivory: RGB(255, 255, 240) → HSL(60°, 100%, 97%)', () => {
      const result = roundHsl(rgbToHsl({ b: 240, g: 255, r: 255 }));
      expect(result).toEqual({ h: 60, l: 97, s: 100 });
    });

    it('linen: RGB(250, 240, 230) → HSL(30°, 67%, 94%)', () => {
      const result = roundHsl(rgbToHsl({ b: 230, g: 240, r: 250 }));
      expect(result).toEqual({ h: 30, l: 94, s: 67 });
    });

    it('old lace: RGB(253, 245, 230) → HSL(39°, 85%, 95%)', () => {
      const result = roundHsl(rgbToHsl({ b: 230, g: 245, r: 253 }));
      expect(result).toEqual({ h: 39, l: 95, s: 85 });
    });

    it('snow: RGB(255, 250, 250) → HSL(0°, 100%, 99%)', () => {
      const result = roundHsl(rgbToHsl({ b: 250, g: 250, r: 255 }));
      expect(result).toEqual({ h: 0, l: 99, s: 100 });
    });

    // This is the cream color from our Rumours test
    it('warm cream: RGB(255, 250, 235) → HSL(45°, 100%, 96%)', () => {
      const result = roundHsl(rgbToHsl({ b: 235, g: 250, r: 255 }));
      expect(result).toEqual({ h: 45, l: 96, s: 100 });
    });
  });

  describe('near-black colors (low lightness)', () => {
    it('very dark gray: RGB(20, 20, 20) → HSL(0°, 0%, 8%)', () => {
      const result = roundHsl(rgbToHsl({ b: 20, g: 20, r: 20 }));
      expect(result).toEqual({ h: 0, l: 8, s: 0 });
    });

    it('dark red: RGB(30, 10, 10) → HSL(0°, 50%, 8%)', () => {
      const result = roundHsl(rgbToHsl({ b: 10, g: 10, r: 30 }));
      expect(result).toEqual({ h: 0, l: 8, s: 50 });
    });
  });
});
