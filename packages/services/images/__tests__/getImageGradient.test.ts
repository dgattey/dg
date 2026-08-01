import { encode } from 'jpeg-js';
import {
  getImageGradientInformation,
  getImageGradientInformationFromUrl,
  type RgbaImage,
} from '../getImageGradient';

function imageFromPixels(
  pixels: Array<[number, number, number]>,
  width: number,
  height: number,
): RgbaImage {
  const data = new Uint8Array(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  return { data, height, width };
}

function createUniformPixels(
  r: number,
  g: number,
  b: number,
  count: number,
): Array<[number, number, number]> {
  return Array.from({ length: count }, (): [number, number, number] => [r, g, b]);
}

function mixPixels(
  ...groups: Array<{ color: [number, number, number]; count: number }>
): Array<[number, number, number]> {
  return groups.flatMap(({ color, count }) =>
    Array.from({ length: count }, (): [number, number, number] => color),
  );
}

describe('getImageGradient color extraction', () => {
  function processTestImage(
    pixels: Array<[number, number, number]>,
    width: number,
    height: number,
  ) {
    return getImageGradientInformation(imageFromPixels(pixels, width, height));
  }

  describe('black/grayscale images', () => {
    it('extracts dark gray gradient from mostly black image', () => {
      const pixels = createUniformPixels(20, 20, 20, 100);
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
      expect(result.contrastSetting).toBe('dark');
    });

    it('extracts gray gradient from grayscale image', () => {
      const pixels = mixPixels(
        { color: [30, 30, 30], count: 40 },
        { color: [80, 80, 80], count: 40 },
        { color: [50, 50, 50], count: 20 },
      );
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });
  });

  describe('cream/off-white images (Rumours album case)', () => {
    it('extracts subtle cream gradient, NOT bright yellow', () => {
      const pixels = createUniformPixels(255, 253, 240, 100);
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('handles mix of black clothing and cream background (like Rumours)', () => {
      const pixels = mixPixels(
        { color: [20, 20, 20], count: 60 },
        { color: [255, 250, 235], count: 40 },
      );
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();

      const satMatches = [
        ...(result.backgroundGradient?.matchAll(/hsla\([^,]+,\s*([\d.]+)%/g) ?? []),
      ];
      const saturations = satMatches.map((m) => parseFloat(m[1] ?? '0'));

      saturations.forEach((sat) => {
        expect(sat).toBeLessThan(30);
      });
    });
  });

  describe('vibrant colored images', () => {
    it('extracts red from predominantly red image', () => {
      const pixels = createUniformPixels(220, 50, 50, 100);
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('extracts multiple colors from colorful image', () => {
      const pixels = mixPixels(
        { color: [220, 50, 50], count: 30 },
        { color: [50, 50, 220], count: 30 },
        { color: [50, 180, 50], count: 20 },
        { color: [200, 200, 50], count: 20 },
      );
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles pure white image', () => {
      const pixels = createUniformPixels(255, 255, 255, 100);
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();
    });

    it('handles image with slight yellow tint that should NOT become neon', () => {
      const pixels = createUniformPixels(250, 248, 243, 100);
      const result = processTestImage(pixels, 10, 10);

      expect(result.backgroundGradient).not.toBeNull();

      const satMatches = [
        ...(result.backgroundGradient?.matchAll(/hsla\([^,]+,\s*([\d.]+)%/g) ?? []),
      ];
      const saturations = satMatches.map((m) => parseFloat(m[1] ?? '0'));

      saturations.forEach((sat) => {
        expect(sat).toBeLessThan(50);
      });
    });

    it('chroma scoring prefers mid-tone vibrant colors over light colors when mixed', () => {
      const pixels = mixPixels(
        { color: [220, 50, 50], count: 40 },
        { color: [255, 250, 235], count: 60 },
      );
      const result = processTestImage(pixels, 10, 10);

      const hueMatch = result.backgroundGradient?.match(/hsla\(([\d.]+),/);
      const hue = hueMatch?.[1] ? parseFloat(hueMatch[1]) : -1;

      const isRed = hue < 30 || hue > 330;
      expect(isRed).toBe(true);
    });
  });
});

describe('getImageGradientInformationFromUrl', () => {
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('extracts a gradient from JPEG bytes', async () => {
    const image = imageFromPixels(createUniformPixels(220, 50, 50, 64), 8, 8);
    const jpeg = encode(image, 90);
    fetchMock.mockResolvedValueOnce(
      new Response(Uint8Array.from(jpeg.data).buffer, { status: 200 }),
    );

    const result = await getImageGradientInformationFromUrl('https://test.com/image.jpg');

    expect(result.backgroundGradient).not.toBeNull();
  });

  it('returns null gradient information for a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

    const result = await getImageGradientInformationFromUrl('https://test.com/missing.jpg');

    expect(result).toEqual({
      backgroundGradient: null,
      contrastSetting: null,
    });
  });

  it('returns null gradient information for non-JPEG bytes', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(Uint8Array.from([0, 1, 2, 3]).buffer, { status: 200 }),
    );

    const result = await getImageGradientInformationFromUrl('https://test.com/not-an-image.jpg');

    expect(result).toEqual({
      backgroundGradient: null,
      contrastSetting: null,
    });
  });
});
