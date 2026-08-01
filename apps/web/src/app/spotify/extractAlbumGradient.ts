import { type Hsl, rgbToHsl } from './rgbToHsl';

type Hsla = Hsl & {
  a: number;
};

type FourItemHsla = [Hsla, Hsla, Hsla, Hsla];

export type ContrastSetting = 'light' | 'dark';

export type AlbumGradientInformation = {
  backgroundGradient: string | null;
  contrastSetting: ContrastSetting | null;
};

const OPTIONS = {
  alphaBottomLeft: 0.8,
  alphaBottomRight: 0.88,
  alphaTopLeft: 0.9,
  alphaTopRight: 0.85,
  extractionLightnessBuffer: 0.45,
  extractionLightnessMultiplier: 0.1,
  hueBucketSize: 20,
  lightnessBands: 5,
  lightnessMax: 0.5,
  lightnessMin: 0.2,
  sampleSize: 40,
} as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function shiftLightness<T extends Hsl | Hsla>(color: T, amount: number): T {
  return { ...color, l: clamp(color.l + amount, 0, 1) };
}

function enhanceForGradient(color: Hsl): Hsl {
  const { lightnessMin, lightnessMax } = OPTIONS;
  const originalChroma = color.s * (1 - Math.abs(2 * color.l - 1));
  const newL = clamp(color.l, lightnessMin, lightnessMax);
  const chromaFactor = 1 - Math.abs(2 * newL - 1);
  const newS = chromaFactor > 0 ? Math.min(1, originalChroma / chromaFactor) : 0;
  return { h: color.h, l: newL, s: newS };
}

function ensureQuadColorArray(colors: Array<Hsl>, fallbackColor: Hsl): FourItemHsla {
  const { alphaTopRight, alphaBottomRight, alphaBottomLeft, alphaTopLeft } = OPTIONS;
  const working = [...colors];
  const primary = working[0] ?? fallbackColor;
  if (working.length === 0) {
    working.push(primary);
  }

  const derivedColors = [
    shiftLightness(primary, 0.1),
    shiftLightness(primary, -0.1),
    shiftLightness(primary, 0.05),
  ];
  for (const color of derivedColors) {
    if (working.length >= 4) {
      break;
    }
    working.push(color);
  }

  const alphas = [alphaTopRight, alphaBottomRight, alphaBottomLeft, alphaTopLeft];
  return working.slice(0, 4).map((hsl, index) => {
    const enhanced = enhanceForGradient(hsl);
    return { ...enhanced, a: alphas[index] ?? alphaTopRight };
  }) as FourItemHsla;
}

const toHslaString = ({ h, s, l, a }: Hsla) =>
  `hsla(${h.toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%, ${a})`;

function buildRadialGradient(colors: FourItemHsla) {
  return [
    `radial-gradient(circle at top right, ${toHslaString(colors[0])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom right, ${toHslaString(colors[1])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom left, ${toHslaString(colors[2])} 0%, transparent 70%)`,
    `radial-gradient(circle at top left, ${toHslaString(colors[3])} 0%, transparent 70%)`,
  ].join(', ');
}

function contrastSettingForGradient(colors: FourItemHsla): ContrastSetting {
  const avgLightness = colors.reduce((sum, c) => sum + c.l * c.a, 0) / colors.length;
  return avgLightness > 0.45 ? 'light' : 'dark';
}

/**
 * Buckets RGBA pixel data by hue and lightness, returning the top vibrant colors.
 * Also returns the mean color of scanned pixels as a fallback.
 */
function getVibrantColorsAndMean(data: Uint8ClampedArray): {
  vibrantColors: Array<Hsl>;
  meanColor: Hsl;
} {
  const {
    hueBucketSize,
    lightnessBands,
    lightnessMax,
    lightnessMin,
    extractionLightnessMultiplier,
    extractionLightnessBuffer,
  } = OPTIONS;

  const buckets = new Map<string, { count: number; hSum: number; sSum: number; lSum: number }>();
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let sampleCount = 0;

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const alpha = data[index + 3] ?? 0;
    if (alpha < 10) {
      continue;
    }

    rSum += r;
    gSum += g;
    bSum += b;
    sampleCount += 1;

    const hsl = rgbToHsl({ b, g, r });
    const minL = lightnessMin * extractionLightnessMultiplier;
    const maxL = lightnessMax + extractionLightnessBuffer;
    if (hsl.l < minL || hsl.l > maxL) {
      continue;
    }

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

  const vibrantColors = Array.from(buckets.values())
    .map(({ count, hSum, sSum, lSum }) => {
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

  const meanColor =
    sampleCount > 0
      ? rgbToHsl({
          b: Math.round(bSum / sampleCount),
          g: Math.round(gSum / sampleCount),
          r: Math.round(rSum / sampleCount),
        })
      : { h: 0, l: 0.2, s: 0 };

  return { meanColor, vibrantColors };
}

/**
 * Builds a CSS radial gradient and contrast hint from sampled RGBA image data.
 */
export function extractAlbumGradientFromImageData(
  data: Uint8ClampedArray,
): AlbumGradientInformation {
  try {
    const { vibrantColors, meanColor } = getVibrantColorsAndMean(data);
    const colors = ensureQuadColorArray(vibrantColors, meanColor);
    return {
      backgroundGradient: buildRadialGradient(colors),
      contrastSetting: contrastSettingForGradient(colors),
    };
  } catch {
    return {
      backgroundGradient: null,
      contrastSetting: null,
    };
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Couldn't load image: ${url}`));
    image.src = url;
  });
}

/**
 * Downsamples album art in a canvas and extracts gradient/contrast for the Spotify card.
 * Spotify CDN serves CORS headers, so canvas pixel reads succeed with crossOrigin=anonymous.
 */
export async function extractAlbumGradientFromUrl(url: string): Promise<AlbumGradientInformation> {
  try {
    const image = await loadImage(url);
    const { sampleSize } = OPTIONS;
    const scale = Math.min(sampleSize / image.naturalWidth, sampleSize / image.naturalHeight, 1);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return { backgroundGradient: null, contrastSetting: null };
    }
    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    return extractAlbumGradientFromImageData(data);
  } catch {
    return {
      backgroundGradient: null,
      contrastSetting: null,
    };
  }
}
