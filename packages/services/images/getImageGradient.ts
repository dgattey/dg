import 'server-only';

import sharp from 'sharp';

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type GradientOptions = {
  angle?: number;
  baseColor?: Rgb;
  fromAlpha?: number;
  toAlpha?: number;
  mix?: number;
  contrast?: number;
};

type ImageStats = {
  channels: Array<{ mean: number }>;
  dominant?: Rgb;
};

type VibrantOptions = {
  bucketSize?: number;
  maxLuminance?: number;
  maxColors?: number;
  minDistance?: number;
  minLuminance?: number;
  minSaturation?: number;
  sampleSize?: number;
};

type ImageGradient = {
  gradient: string;
  isDark: boolean;
};

const DEFAULT_OPTIONS: Required<GradientOptions> = {
  // Tuned defaults for subdued gradients.
  angle: 45,
  baseColor: { b: 0, g: 0, r: 0 },
  contrast: 0.45,
  fromAlpha: 0.9,
  mix: 0.1,
  toAlpha: 0.8,
};

const DEFAULT_VIBRANT_OPTIONS: Required<VibrantOptions> = {
  // Keep sampling small; we only need representative hues.
  bucketSize: 24,
  maxColors: 4,
  maxLuminance: 0.75,
  minDistance: 60,
  minLuminance: 0.1,
  minSaturation: 0.24,
  sampleSize: 36,
};

// Basic color math helpers.
const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const mixRgb = (first: Rgb, second: Rgb, ratio: number) => {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  return {
    b: clampChannel(first.b + (second.b - first.b) * clampedRatio),
    g: clampChannel(first.g + (second.g - first.g) * clampedRatio),
    r: clampChannel(first.r + (second.r - first.r) * clampedRatio),
  };
};

const luminance = ({ r, g, b }: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const shiftLightness = (color: Rgb, amount: number) => {
  const target = amount >= 0 ? { b: 255, g: 255, r: 255 } : { b: 0, g: 0, r: 0 };
  return mixRgb(color, target, Math.abs(amount));
};

const clampToMidRange = (color: Rgb, min = 0.15, max = 0.7) => {
  const value = luminance(color);
  if (value < min) {
    const amount = Math.min(0.6, (min - value) / min);
    return shiftLightness(color, amount);
  }
  if (value > max) {
    const amount = Math.min(0.6, (value - max) / (1 - max));
    return shiftLightness(color, -amount);
  }
  return color;
};

const boostSaturation = (color: Rgb, amount: number) => {
  const gray = (color.r + color.g + color.b) / 3;
  return {
    b: clampChannel(gray + (color.b - gray) * (1 + amount)),
    g: clampChannel(gray + (color.g - gray) * (1 + amount)),
    r: clampChannel(gray + (color.r - gray) * (1 + amount)),
  };
};

const adjustForGradient = (color: Rgb) => {
  // Nudge colors toward mid luminance and richer saturation so gradients
  // stay visible against UI chrome.
  const clamped = clampToMidRange(color);
  const saturated = boostSaturation(clamped, 0.55);
  const darkened = shiftLightness(saturated, -0.2);
  return clampToMidRange(darkened, 0.12, 0.7);
};

const ensureQuadColors = (colors: Array<Rgb>, contrast: number) => {
  // Prefer provided colors; derive missing swatches from the first.
  const result = colors.slice(0, 4);
  if (result.length === 0 || result.length === 4) {
    return result;
  }
  const base = result[0];
  if (!base) {
    return result;
  }
  const derived = [
    adjustForGradient(shiftLightness(base, contrast)),
    adjustForGradient(shiftLightness(base, -contrast)),
    adjustForGradient(shiftLightness(base, contrast * 0.6)),
  ];
  for (const color of derived) {
    if (result.length >= 4) {
      break;
    }
    result.push(color);
  }
  return result;
};

const toRgba = ({ r, g, b }: Rgb, alpha: number) =>
  `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${alpha})`;

const mixWithBase = (color: Rgb, baseColor: Rgb, alpha: number) => mixRgb(baseColor, color, alpha);

const deriveAccent = (color: Rgb, contrast: number) =>
  adjustForGradient(
    luminance(color) > 0.5 ? shiftLightness(color, -contrast) : shiftLightness(color, contrast),
  );

const buildLinearGradient = (
  angle: number,
  start: Rgb,
  startAlpha: number,
  end: Rgb,
  endAlpha: number,
) => `linear-gradient(${angle}deg, ${toRgba(start, startAlpha)}, ${toRgba(end, endAlpha)})`;

const buildRadialGradientStack = (
  primary: Rgb,
  secondary: Rgb,
  tertiary: Rgb,
  quaternary: Rgb,
  primaryAlpha: number,
  secondaryAlpha: number,
  tertiaryAlpha: number,
  quaternaryAlpha: number,
) =>
  [
    `radial-gradient(circle at top right, ${toRgba(primary, primaryAlpha)} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom left, ${toRgba(secondary, secondaryAlpha)} 0%, transparent 70%)`,
    `radial-gradient(circle at top left, ${toRgba(tertiary, tertiaryAlpha)} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom right, ${toRgba(quaternary, quaternaryAlpha)} 0%, transparent 70%)`,
  ].join(', ');

const toRelativeLuminance = ({ r, g, b }: Rgb) => {
  // WCAG relative luminance.
  const normalize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const red = normalize(r);
  const green = normalize(g);
  const blue = normalize(b);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const getContrastRatio = (first: Rgb, second: Rgb) => {
  const firstLum = toRelativeLuminance(first);
  const secondLum = toRelativeLuminance(second);
  const lighter = Math.max(firstLum, secondLum);
  const darker = Math.min(firstLum, secondLum);
  return (lighter + 0.05) / (darker + 0.05);
};

const shouldUseLightText = (colors: Array<Rgb>) => {
  // Compare average contrast against white vs black text.
  const white: Rgb = { b: 255, g: 255, r: 255 };
  const black: Rgb = { b: 0, g: 0, r: 0 };
  const contrastWithWhite =
    colors.reduce((total, color) => total + getContrastRatio(white, color), 0) / colors.length;
  const contrastWithBlack =
    colors.reduce((total, color) => total + getContrastRatio(black, color), 0) / colors.length;
  return contrastWithWhite >= contrastWithBlack;
};

const shouldUseLightTextForBase = (baseColor: Rgb, colors: Array<[Rgb, number]>) =>
  shouldUseLightText(colors.map(([color, alpha]) => mixWithBase(color, baseColor, alpha)));

const rgbDistance = (first: Rgb, second: Rgb) => {
  const r = first.r - second.r;
  const g = first.g - second.g;
  const b = first.b - second.b;
  return Math.sqrt(r * r + g * g + b * b);
};

const rgbToHsl = ({ r, g, b }: Rgb) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  if (delta === 0) {
    return { lightness, saturation: 0 };
  }
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  return { lightness, saturation };
};

const quantizeChannel = (value: number, bucketSize: number) =>
  clampChannel(Math.round(value / bucketSize) * bucketSize);

const getDominantRgb = (stats: ImageStats): Rgb | null => {
  if (stats.dominant && typeof stats.dominant.r === 'number') {
    return {
      b: clampChannel(stats.dominant.b),
      g: clampChannel(stats.dominant.g),
      r: clampChannel(stats.dominant.r),
    };
  }
  return null;
};

const getMeanRgb = (stats: ImageStats): Rgb | null => {
  if (stats.channels.length < 3) {
    return null;
  }
  const [rChannel, gChannel, bChannel] = stats.channels;
  if (!rChannel || !gChannel || !bChannel) {
    return null;
  }
  return {
    b: clampChannel(bChannel.mean),
    g: clampChannel(gChannel.mean),
    r: clampChannel(rChannel.mean),
  };
};

// Downsample, bucket, and keep the most saturated distinct colors.
const getVibrantColors = async (
  buffer: Buffer,
  options: VibrantOptions = {},
): Promise<Array<Rgb>> => {
  const {
    bucketSize,
    maxColors,
    maxLuminance,
    minDistance,
    minLuminance,
    minSaturation,
    sampleSize,
  } = {
    ...DEFAULT_VIBRANT_OPTIONS,
    ...options,
  };

  const { data, info } = await sharp(buffer)
    .resize(sampleSize, sampleSize, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels < 3) {
    return [];
  }

  const hasAlpha = info.channels === 4;
  const buckets = new Map<
    string,
    { count: number; maxSaturation: number; rSum: number; gSum: number; bSum: number }
  >();
  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const alpha = hasAlpha ? (data[index + 3] ?? 0) : 255;
    if (alpha < 10) {
      continue;
    }
    const color = { b, g, r };
    const lightness = luminance(color);
    if (lightness < minLuminance || lightness > maxLuminance) {
      continue;
    }
    const { saturation } = rgbToHsl(color);
    if (saturation < minSaturation) {
      continue;
    }
    const quantized = {
      b: quantizeChannel(b, bucketSize),
      g: quantizeChannel(g, bucketSize),
      r: quantizeChannel(r, bucketSize),
    };
    const key = `${quantized.r}-${quantized.g}-${quantized.b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.maxSaturation = Math.max(existing.maxSaturation, saturation);
      existing.rSum += r;
      existing.gSum += g;
      existing.bSum += b;
    } else {
      buckets.set(key, {
        bSum: b,
        count: 1,
        gSum: g,
        maxSaturation: saturation,
        rSum: r,
      });
    }
  }

  const candidates = Array.from(buckets.values()).map((bucket) => {
    const count = bucket.count;
    const average = {
      b: bucket.bSum / count,
      g: bucket.gSum / count,
      r: bucket.rSum / count,
    };
    return {
      color: {
        b: clampChannel(average.b),
        g: clampChannel(average.g),
        r: clampChannel(average.r),
      },
      score: bucket.maxSaturation * Math.sqrt(count),
    };
  });

  candidates.sort((first, second) => second.score - first.score);
  const selected: Array<(typeof candidates)[number]> = [];
  for (const candidate of candidates) {
    if (selected.length === 0) {
      selected.push(candidate);
      continue;
    }
    const hasDistance = selected.every(
      (existing) => rgbDistance(existing.color, candidate.color) >= minDistance,
    );
    if (hasDistance) {
      selected.push(candidate);
    }
    if (selected.length >= maxColors) {
      break;
    }
  }

  return selected.map((candidate) => candidate.color);
};

/**
 * Returns a subtle CSS gradient derived from an image URL, or null on failure.
 */
export async function getImageGradientFromUrl(
  url: string,
  options: GradientOptions = {},
): Promise<ImageGradient | null> {
  const { angle, baseColor, contrast, fromAlpha, mix, toAlpha } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const stats = (await sharp(buffer).stats()) as ImageStats;
    const mean = getMeanRgb(stats);
    const vibrant = await getVibrantColors(buffer);
    if (!mean && vibrant.length === 0) {
      return null;
    }
    const dominant = getDominantRgb(stats) ?? mean;
    const adjusted = vibrant.map(adjustForGradient);
    // Prefer a 4-color radial stack when we have enough vibrant swatches.
    const [primary, secondary, tertiary, quaternary] = ensureQuadColors(adjusted, contrast);
    if (primary && secondary && tertiary && quaternary) {
      const primaryAlpha = toAlpha;
      const secondaryAlpha = fromAlpha;
      const tertiaryAlpha = fromAlpha * 0.85;
      const quaternaryAlpha = fromAlpha * 0.85;
      return {
        gradient: buildRadialGradientStack(
          primary,
          secondary,
          tertiary,
          quaternary,
          primaryAlpha,
          secondaryAlpha,
          tertiaryAlpha,
          quaternaryAlpha,
        ),
        isDark: shouldUseLightTextForBase(baseColor, [
          [primary, primaryAlpha],
          [secondary, secondaryAlpha],
          [tertiary, tertiaryAlpha],
          [quaternary, quaternaryAlpha],
        ]),
      };
    }
    const [fallbackPrimary, fallbackSecondary] = adjusted;
    if (fallbackPrimary && fallbackSecondary) {
      return {
        gradient: buildLinearGradient(
          angle,
          fallbackSecondary,
          fromAlpha,
          fallbackPrimary,
          toAlpha,
        ),
        isDark: shouldUseLightTextForBase(baseColor, [
          [fallbackSecondary, fromAlpha],
          [fallbackPrimary, toAlpha],
        ]),
      };
    }
    if (fallbackPrimary) {
      const accent = deriveAccent(fallbackPrimary, contrast);
      return {
        gradient: buildLinearGradient(angle, accent, fromAlpha, fallbackPrimary, toAlpha),
        isDark: shouldUseLightTextForBase(baseColor, [
          [accent, fromAlpha],
          [fallbackPrimary, toAlpha],
        ]),
      };
    }
    if (!dominant || !mean) {
      return null;
    }
    // Last resort: blend mean + dominant, then derive an accent.
    const blended = adjustForGradient(mixRgb(dominant, mean, mix));
    const accent = deriveAccent(blended, contrast);
    return {
      gradient: buildLinearGradient(angle, accent, fromAlpha, blended, toAlpha),
      isDark: shouldUseLightTextForBase(baseColor, [
        [accent, fromAlpha],
        [blended, toAlpha],
      ]),
    };
  } catch {
    return null;
  }
}
