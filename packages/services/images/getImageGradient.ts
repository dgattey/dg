import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { decode } from 'jpeg-js';

import { type Hsl, rgbToHsl } from './colorConversion';

export type RgbaImage = {
  /** Row-major RGBA bytes, four per pixel */
  data: Uint8Array;
  height: number;
  width: number;
};

type Hsla = Hsl & {
  /** Alpha, 0-1 */
  a: number;
};

type FourItemHsla = [Hsla, Hsla, Hsla, Hsla];

type ContrastSetting = 'light' | 'dark';

type ImageGradientInformation = {
  backgroundGradient: string | null;
  contrastSetting: ContrastSetting | null;
};

/**
 * Alpha values by corner position.
 * Colors are assigned by prominence: most prominent → top right, least → top left.
 */
const OPTIONS = {
  alphaBottomLeft: 0.8,
  alphaBottomRight: 0.88,
  alphaTopLeft: 0.9,
  alphaTopRight: 0.85,
  /**
   * Extraction is more permissive than final clamping to capture edge colors.
   * These multipliers widen the acceptable range during pixel scanning.
   */
  extractionLightnessBuffer: 0.45,
  extractionLightnessMultiplier: 0.1,
  /** Hue bucket size in degrees (45° = 8 color groups around the wheel) */
  hueBucketSize: 20,
  /** Lightness bands per hue bucket (allows multiple shades of the same hue) */
  lightnessBands: 5,
  lightnessMax: 0.5,
  /** Lightness clamp range for final gradient colors */
  lightnessMin: 0.2,
} as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Shifts lightness by an amount (-1 to 1). Positive = lighter, negative = darker.
 */
function shiftLightness<T extends Hsl | Hsla>(color: T, amount: number): T {
  return { ...color, l: clamp(color.l + amount, 0, 1) };
}

/**
 * Prepares a color for use in gradients by clamping lightness for text readability.
 * When lightness is clamped, saturation is adjusted to preserve perceived chroma.
 * This prevents light colors (cream) from becoming vivid (olive) when darkened.
 *
 * Chroma ≈ S × (1 - |2L - 1|), so at L=0.5 chroma equals S.
 * To preserve chroma when changing lightness, we scale saturation accordingly.
 */
function enhanceForGradient(color: Hsl): Hsl {
  const { lightnessMin, lightnessMax } = OPTIONS;

  // Calculate original chroma (perceived colorfulness)
  const originalChroma = color.s * (1 - Math.abs(2 * color.l - 1));

  // Clamp lightness for readability
  const newL = clamp(color.l, lightnessMin, lightnessMax);

  // Calculate what saturation would produce the same chroma at new lightness
  const chromaFactor = 1 - Math.abs(2 * newL - 1);
  const newS = chromaFactor > 0 ? Math.min(1, originalChroma / chromaFactor) : 0;

  return { h: color.h, l: newL, s: newS };
}

/**
 * Ensures we have exactly 4 colors, padding with lightness variants if needed.
 * Colors are sorted by prominence (index 0 = most prominent).
 */
function ensureQuadColorArray(colors: Array<Hsl>, fallbackColor: Hsl): FourItemHsla {
  const { alphaTopRight, alphaBottomRight, alphaBottomLeft, alphaTopLeft } = OPTIONS;

  // If no colors extracted (e.g., grayscale image), use the fallback as primary
  const primary = colors[0] ?? fallbackColor;
  if (colors.length === 0) {
    colors.push(primary);
  }

  // Pad with lightness variants of the primary color if we don't have 4
  const derivedColors = [
    shiftLightness(primary, 0.1),
    shiftLightness(primary, -0.1),
    shiftLightness(primary, 0.05),
  ];
  for (const color of derivedColors) {
    if (colors.length >= 4) {
      break;
    }
    colors.push(color);
  }

  // Enhance colors and add alpha by corner position
  // Index 0 (most prominent) → top right, Index 3 (least) → top left
  const alphas = [alphaTopRight, alphaBottomRight, alphaBottomLeft, alphaTopLeft];
  return colors.slice(0, 4).map((hsl, index) => {
    const enhanced = enhanceForGradient(hsl);
    return { ...enhanced, a: alphas[index] ?? alphaTopRight };
  }) as FourItemHsla;
}

/**
 * Converts HSLA to CSS hsla() string
 */
const toHslaString = ({ h, s, l, a }: Hsla) =>
  `hsla(${h.toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%, ${a})`;

/**
 * Returns a radial gradient from four colors.
 * Stacked by prominence: most prominent (colors[0]) on top of stack,
 * least prominent (colors[3]) at bottom. Dominant color covers the most area.
 *
 * Corner assignments: top right (most) → bottom right → bottom left → top left (least)
 */
function buildRadialGradient(colors: FourItemHsla) {
  return [
    `radial-gradient(circle at top right, ${toHslaString(colors[0])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom right, ${toHslaString(colors[1])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom left, ${toHslaString(colors[2])} 0%, transparent 70%)`,
    `radial-gradient(circle at top left, ${toHslaString(colors[3])} 0%, transparent 70%)`,
  ].join(', ');
}

/**
 * Returns recommended light/dark text color based on average gradient lightness
 */
function contrastSettingForGradient(colors: FourItemHsla): ContrastSetting {
  const avgLightness = colors.reduce((sum, c) => sum + c.l * c.a, 0) / colors.length;
  // Dark text on light backgrounds, light text on dark backgrounds
  return avgLightness > 0.45 ? 'light' : 'dark';
}

/**
 * Bucket by hue AND lightness, and keep the most vibrant colors.
 * Bucketing by both dimensions allows images that are predominantly one hue
 * (e.g., mostly red) to yield multiple shades of that hue.
 */
function getVibrantColors(image: RgbaImage): Array<Hsl> {
  const {
    hueBucketSize,
    lightnessBands,
    lightnessMax,
    lightnessMin,
    extractionLightnessMultiplier,
    extractionLightnessBuffer,
  } = OPTIONS;

  // Bucket colors by hue AND lightness - allows multiple shades of the same hue
  const buckets = new Map<string, { count: number; hSum: number; sSum: number; lSum: number }>();
  const pixelDataLength = image.width * image.height * 4;

  for (let index = 0; index < pixelDataLength; index += 4) {
    const r = image.data[index] ?? 0;
    const g = image.data[index + 1] ?? 0;
    const b = image.data[index + 2] ?? 0;

    // Skip transparent colors
    const alpha = image.data[index + 3] ?? 0;
    if (alpha < 10) {
      continue;
    }

    const hsl = rgbToHsl({ b, g, r });

    // Skip only extreme lightness values (pure black/white edges)
    // No saturation filtering - chroma scoring handles color prominence
    const minL = lightnessMin * extractionLightnessMultiplier;
    const maxL = lightnessMax + extractionLightnessBuffer;
    if (hsl.l < minL || hsl.l > maxL) {
      continue;
    }

    // Bucket by quantized hue AND lightness band
    const hueBucket = Math.round(hsl.h / hueBucketSize) * hueBucketSize;
    const lightnessBand = Math.min(Math.floor(hsl.l * lightnessBands), lightnessBands - 1);
    const bucketKey = `${hueBucket}-${lightnessBand}`;

    const existing = buckets.get(bucketKey);
    if (existing) {
      existing.count += 1;
      existing.hSum += hsl.h;
      existing.sSum += hsl.s;
      existing.lSum += hsl.l;
    } else {
      buckets.set(bucketKey, {
        count: 1,
        hSum: hsl.h,
        lSum: hsl.l,
        sSum: hsl.s,
      });
    }
  }

  // Score by saturation weighted by frequency, take top 4
  // Use count^0.6 to weight pixel count more heavily than sqrt
  // This prevents small bright accents from dominating large color areas
  return Array.from(buckets.entries())
    .map(([, { count, hSum, sSum, lSum }]) => {
      const avgS = sSum / count;
      const avgL = lSum / count;
      return {
        color: { h: hSum / count, l: avgL, s: avgS },
        score: avgS * count ** 0.55,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ color }) => color);
}

type HistogramBin = {
  bSum: number;
  count: number;
  gSum: number;
  rSum: number;
};

/**
 * Most populous bin of a 16x16x16 RGB histogram, averaged over the pixels in it.
 */
function getDominantHsl(image: RgbaImage): Hsl {
  const histogram = new Map<number, HistogramBin>();
  const pixelDataLength = image.width * image.height * 4;

  for (let index = 0; index < pixelDataLength; index += 4) {
    const r = image.data[index] ?? 0;
    const g = image.data[index + 1] ?? 0;
    const b = image.data[index + 2] ?? 0;
    const binKey = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
    const bin = histogram.get(binKey);

    if (bin) {
      bin.bSum += b;
      bin.count += 1;
      bin.gSum += g;
      bin.rSum += r;
    } else {
      histogram.set(binKey, {
        bSum: b,
        count: 1,
        gSum: g,
        rSum: r,
      });
    }
  }

  let dominantBin: HistogramBin | null = null;
  for (const bin of histogram.values()) {
    if (!dominantBin || bin.count > dominantBin.count) {
      dominantBin = bin;
    }
  }
  invariant(dominantBin, 'Image has no pixels');

  return rgbToHsl({
    b: dominantBin.bSum / dominantBin.count,
    g: dominantBin.gSum / dominantBin.count,
    r: dominantBin.rSum / dominantBin.count,
  });
}

/**
 * Returns an up-to-4-color radial gradient from decoded pixels, and an indicator for the
 * recommended text color when used on top of the gradient.
 */
export function getImageGradientInformation(image: RgbaImage): ImageGradientInformation {
  invariant(
    image.width > 0 && image.height > 0 && image.data.length >= image.width * image.height * 4,
    'Malformed image',
  );

  const colors = ensureQuadColorArray(getVibrantColors(image), getDominantHsl(image));
  return {
    backgroundGradient: buildRadialGradient(colors),
    contrastSetting: contrastSettingForGradient(colors),
  };
}

/**
 * Fetches a JPEG and returns its gradient information. Decoding is capped well above album art
 * (640x640 is 0.41MP) so a hostile response can't exhaust the function's memory.
 */
export async function getImageGradientInformationFromUrl(
  url: string,
): Promise<ImageGradientInformation> {
  try {
    const imageResponse = await fetch(url);
    invariant(imageResponse.ok, `Couldn't fetch image: ${imageResponse.status}`);
    const bytes = new Uint8Array(await imageResponse.arrayBuffer());
    const decoded = decode(bytes, {
      maxMemoryUsageInMB: 64,
      maxResolutionInMP: 1,
      useTArray: true,
    });
    return getImageGradientInformation(decoded);
  } catch (error) {
    log.warn("Couldn't get image gradient", {
      error,
      url,
    });
    return {
      backgroundGradient: null,
      contrastSetting: null,
    };
  }
}
