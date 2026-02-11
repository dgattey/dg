import sharp from 'sharp';
import { getImageGradientInformationFromUrl } from '../getImageGradient';

// Mock fetch
global.fetch = jest.fn();

// Helper to create a mock image buffer with specific RGB pixels
function createMockImageBuffer(pixels: Array<[number, number, number]>): Buffer {
  // Create raw RGB buffer from pixel array
  const data = new Uint8Array(pixels.length * 3);
  pixels.forEach(([r, g, b], i) => {
    data[i * 3] = r;
    data[i * 3 + 1] = g;
    data[i * 3 + 2] = b;
  });
  return Buffer.from(data);
}

// Helper to create uniform color image (all same pixel)
function createUniformPixels(
  r: number,
  g: number,
  b: number,
  count: number,
): Array<[number, number, number]> {
  return Array(count).fill([r, g, b]) as Array<[number, number, number]>;
}

// Helper to mix pixels of different colors
function mixPixels(
  ...groups: Array<{ color: [number, number, number]; count: number }>
): Array<[number, number, number]> {
  return groups.flatMap(({ color, count }) => Array(count).fill(color)) as Array<
    [number, number, number]
  >;
}

describe('getImageGradient color extraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test helper that processes an image and returns extracted info for inspection
  async function processTestImage(
    pixels: Array<[number, number, number]>,
    width: number,
    height: number,
  ) {
    const rawBuffer = createMockImageBuffer(pixels);

    // Create actual sharp image from raw pixel data
    const imageBuffer = await sharp(rawBuffer, {
      raw: { channels: 3, height, width },
    })
      .png()
      .toBuffer();

    // Mock fetch to return our test image
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(imageBuffer),
      ok: true,
    });

    return getImageGradientInformationFromUrl('https://test.com/image.png');
  }

  describe('black/grayscale images', () => {
    it('extracts dark gray gradient from mostly black image', async () => {
      // Pure black pixels (RGB: 0, 0, 0)
      const pixels = createUniformPixels(20, 20, 20, 100); // 10x10 dark gray
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
      expect(result.contrastSetting).toBe('dark'); // Dark background = light text
    });

    it('extracts gray gradient from grayscale image', async () => {
      // Mix of grays
      const pixels = mixPixels(
        { color: [30, 30, 30], count: 40 }, // Dark gray
        { color: [80, 80, 80], count: 40 }, // Medium gray
        { color: [50, 50, 50], count: 20 }, // Mid-dark gray
      );
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });
  });

  describe('cream/off-white images (Rumours album case)', () => {
    it('extracts subtle cream gradient, NOT bright yellow', async () => {
      // Cream color: RGB ~255, 253, 240 (very light, slight yellow tint)
      // In HSL: hue ~45, saturation ~0.1, lightness ~0.97
      const pixels = createUniformPixels(255, 253, 240, 100);
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('handles mix of black clothing and cream background (like Rumours)', async () => {
      // Simulating Rumours: ~60% black clothing, ~40% cream background
      const pixels = mixPixels(
        { color: [20, 20, 20], count: 60 }, // Black clothing
        { color: [255, 250, 235], count: 40 }, // Cream background
      );
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();

      // Extract saturation values - should be low (not bright yellow)
      const satMatches = [
        ...(result.backgroundGradient?.matchAll(/hsla\([^,]+,\s*([\d.]+)%/g) ?? []),
      ];
      const saturations = satMatches.map((m) => parseFloat(m[1] ?? '0'));

      // All saturations should be under 30% (muted, not vibrant yellow)
      saturations.forEach((sat) => {
        expect(sat).toBeLessThan(30);
      });
    });
  });

  describe('vibrant colored images', () => {
    it('extracts red from predominantly red image', async () => {
      // Vibrant red: RGB 220, 50, 50
      const pixels = createUniformPixels(220, 50, 50, 100);
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('extracts multiple colors from colorful image', async () => {
      // Mix of vibrant colors
      const pixels = mixPixels(
        { color: [220, 50, 50], count: 30 }, // Red
        { color: [50, 50, 220], count: 30 }, // Blue
        { color: [50, 180, 50], count: 20 }, // Green
        { color: [200, 200, 50], count: 20 }, // Yellow
      );
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles pure white image', async () => {
      const pixels = createUniformPixels(255, 255, 255, 100);
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('handles image with slight yellow tint that should NOT become neon', async () => {
      // RGB 250, 248, 243 is a subtle cream (~30% saturation in HSL)
      const pixels = createUniformPixels(250, 248, 243, 100);
      const result = await processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();

      // Extract all saturation percentages - should stay low
      const satMatches = [
        ...(result.backgroundGradient?.matchAll(/hsla\([^,]+,\s*([\d.]+)%/g) ?? []),
      ];
      const saturations = satMatches.map((m) => parseFloat(m[1] ?? '0'));

      saturations.forEach((sat) => {
        expect(sat).toBeLessThan(50);
      });
    });

    it('chroma scoring prefers mid-tone vibrant colors over light colors when mixed', async () => {
      // When vibrant red competes with cream, red should dominate
      const pixels = mixPixels(
        { color: [220, 50, 50], count: 40 }, // Vibrant red (mid-tone)
        { color: [255, 250, 235], count: 60 }, // Cream (high lightness)
      );
      const result = await processTestImage(pixels, 10, 10);

      // Extract first (most prominent) color's hue - should be red (~0°), not yellow (~45°)
      const hueMatch = result.backgroundGradient?.match(/hsla\(([\d.]+),/);
      const hue = hueMatch?.[1] ? parseFloat(hueMatch[1]) : -1;

      // Hue should be in red range (0-30° or 330-360°), not yellow range (40-60°)
      const isRed = hue < 30 || hue > 330;
      expect(isRed).toBe(true);
    });
  });
});
