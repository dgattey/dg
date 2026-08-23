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

function srgbChannelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number) {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;
  if (huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }
  const match = l - chroma / 2;
  return {
    b: Math.round((blue + match) * 255),
    g: Math.round((green + match) * 255),
    r: Math.round((red + match) * 255),
  };
}

function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } | null {
  const raw =
    hex.length === 3 || hex.length === 4
      ? [...hex].map((digit) => `${digit}${digit}`).join('')
      : hex;
  if (raw.length !== 6 && raw.length !== 8) {
    return null;
  }
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
  if ([r, g, b, a].some((channel) => Number.isNaN(channel))) {
    return null;
  }
  return { a, b, g, r };
}

/**
 * Contrast hint from a CSS gradient string when the extractor did not
 * store `contrastSetting`. Dark washes get light type; light washes get
 * dark type. Unparseable strings follow the usual album-wash default.
 */
export function contrastSettingFromGradientCss(gradient: string): ContrastSetting {
  const samples: Array<{ alpha: number; luminance: number }> = [];

  for (const match of gradient.matchAll(
    /hsla?\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/gi,
  )) {
    const rgb = hslToRgb(
      Number.parseFloat(match[1] ?? '0'),
      Number.parseFloat(match[2] ?? '0') / 100,
      Number.parseFloat(match[3] ?? '0') / 100,
    );
    samples.push({
      alpha: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
      luminance: relativeLuminance(rgb.r, rgb.g, rgb.b),
    });
  }

  for (const match of gradient.matchAll(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/gi,
  )) {
    samples.push({
      alpha: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
      luminance: relativeLuminance(
        Number.parseFloat(match[1] ?? '0'),
        Number.parseFloat(match[2] ?? '0'),
        Number.parseFloat(match[3] ?? '0'),
      ),
    });
  }

  for (const match of gradient.matchAll(/#([0-9a-f]{3,8})\b/gi)) {
    const parsed = parseHexColor(match[1] ?? '');
    if (!parsed) {
      continue;
    }
    samples.push({
      alpha: parsed.a,
      luminance: relativeLuminance(parsed.r, parsed.g, parsed.b),
    });
  }

  const opaque = samples.filter((sample) => sample.alpha > 0);
  if (opaque.length === 0) {
    return 'dark';
  }
  const weight = opaque.reduce((sum, sample) => sum + sample.alpha, 0);
  const average = opaque.reduce((sum, sample) => sum + sample.luminance * sample.alpha, 0) / weight;
  return average > 0.45 ? 'light' : 'dark';
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
