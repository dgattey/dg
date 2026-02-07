import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import sharp, { type Stats } from 'sharp';

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Rgba = Rgb & {
  a: number;
};

type FourItemRgba = [Rgba, Rgba, Rgba, Rgba];

type ContrastSetting = 'light' | 'dark';

type ImageGradientInformation = {
  backgroundGradient: string | null;
  contrastSetting: ContrastSetting | null;
};

// All options
const OPTIONS = {
  baseColor: { a: 1, b: 0, g: 0, r: 0 },
  /** Number of buckets for vibrancy algorithm - reduces variation in color */
  bucketSize: 24,
  contrast: 0.45,
  /** Colors aren't allowed to be more luminous than this */
  maxLuminance: 0.75,
  minDistance: 60,
  /** Colors aren't allowed to be less luminous than this */
  minLuminance: 0.1,
  primaryAlpha: 0.8,
  quaternaryAlpha: 0.85,
  /** Size of scaled down image for getting vibrancy for performance */
  sampleSize: 36,
  secondaryAlpha: 0.9,
  tertiaryAlpha: 0.85,
} as const;

// Basic color math helpers.
const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

function isRgba(color: Rgb | Rgba): color is Rgba {
  return 'a' in color;
}

function mixRgb<T extends Rgb | Rgba>(first: T, second: T, ratio: number): T {
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  if (isRgba(first) && isRgba(second)) {
    return {
      a: clampChannel(first.a + (second.a - first.a) * clampedRatio),
      b: clampChannel(first.b + (second.b - first.b) * clampedRatio),
      g: clampChannel(first.g + (second.g - first.g) * clampedRatio),
      r: clampChannel(first.r + (second.r - first.r) * clampedRatio),
    } as T;
  }
  return {
    b: clampChannel(first.b + (second.b - first.b) * clampedRatio),
    g: clampChannel(first.g + (second.g - first.g) * clampedRatio),
    r: clampChannel(first.r + (second.r - first.r) * clampedRatio),
  } as T;
}

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

/**
 * Increases saturation by a given amount
 */
function boostSaturation(color: Rgb, amount: number) {
  const gray = (color.r + color.g + color.b) / 3;
  return {
    b: clampChannel(gray + (color.b - gray) * (1 + amount)),
    g: clampChannel(gray + (color.g - gray) * (1 + amount)),
    r: clampChannel(gray + (color.r - gray) * (1 + amount)),
  };
}

/**
 * Nudges a color towards mid luminance and richer saturation for more
 * visible gradients against a range of backgrounds.
 */
function boostSaturationAndNudgeToMidLuminence(color: Rgb) {
  const clamped = clampToMidRange(color);
  const saturated = boostSaturation(clamped, 0.6);
  const darkened = shiftLightness(saturated, -0.3);
  return clampToMidRange(darkened, 0.12, 0.7);
}

/**
 * If we have < 4 colors in our array, pad it with variants of the base color
 * until we're at 4 colors and bump saturation/nudge to mid luminence.
 */
function ensureQuadColorArray(colors: Array<Rgb>, fallbackColor: Rgb): FourItemRgba {
  const { contrast, primaryAlpha, secondaryAlpha, tertiaryAlpha, quaternaryAlpha } = OPTIONS;
  const primary = colors[0] ?? fallbackColor;

  // Pad with more variants of the base color as needed
  const derivedColors: Array<Rgb> = [
    shiftLightness(primary, contrast),
    shiftLightness(primary, -contrast),
    shiftLightness(primary, contrast * 0.6),
  ];
  for (const color of derivedColors) {
    if (colors.length >= 4) {
      break;
    }
    colors.push(color);
  }

  // Get down to 4 items and boost colors
  return colors
    .slice(0, 4)
    .map(boostSaturationAndNudgeToMidLuminence)
    .map((rgb, index) => {
      switch (index) {
        case 0:
          return { ...rgb, a: primaryAlpha };
        case 1:
          return { ...rgb, a: secondaryAlpha };
        case 2:
          return { ...rgb, a: tertiaryAlpha };
        case 3:
          return { ...rgb, a: quaternaryAlpha };
      }
      throw new TypeError('Bad slice logic');
    }) as [Rgba, Rgba, Rgba, Rgba];
}

const toRgba = ({ r, g, b, a }: Rgba) =>
  `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${a})`;

/**
 * Returns a radial gradient from four colors, with all coalescing into each other if not enough to
 * go around.
 */
function buildRadialGradient(colors: FourItemRgba) {
  return [
    `radial-gradient(circle at top right, ${toRgba(colors[0])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom left, ${toRgba(colors[1])} 0%, transparent 70%)`,
    `radial-gradient(circle at top left, ${toRgba(colors[2])} 0%, transparent 70%)`,
    `radial-gradient(circle at bottom right, ${toRgba(colors[3])} 0%, transparent 70%)`,
  ].join(', ');
}

function toRelativeLuminance({ r, g, b }: Rgb) {
  // WCAG relative luminance.
  const normalize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const red = normalize(r);
  const green = normalize(g);
  const blue = normalize(b);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrastRatio(first: Rgb, second: Rgb) {
  const firstLum = toRelativeLuminance(first);
  const secondLum = toRelativeLuminance(second);
  const lighter = Math.max(firstLum, secondLum);
  const darker = Math.min(firstLum, secondLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns a recommended light/dark text color based on the gradient array
 */
function contrastSettingForGradient(colors: FourItemRgba): ContrastSetting {
  const { baseColor } = OPTIONS;
  const mixedColors = colors.map((color) => mixRgb(baseColor, color, color.a));

  // Compare average contrast against white vs black text.
  const white: Rgb = { b: 255, g: 255, r: 255 };
  const black: Rgb = { b: 0, g: 0, r: 0 };
  const contrastWithWhite =
    mixedColors.reduce((total, color) => total + getContrastRatio(white, color), 0) /
    mixedColors.length;
  const contrastWithBlack =
    mixedColors.reduce((total, color) => total + getContrastRatio(black, color), 0) /
    mixedColors.length;
  return contrastWithWhite >= contrastWithBlack ? 'light' : 'dark';
}

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

/**
 * Downsample, bucket, and keep the most vibrant colors
 */
async function getVibrantColors(buffer: Buffer): Promise<Array<Rgb>> {
  const { bucketSize, maxLuminance, minDistance, minLuminance, sampleSize } = OPTIONS;

  // Smaller image to better get vibrant colors + process less
  const { data, info } = await sharp(buffer)
    .resize(sampleSize, sampleSize, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hasAlpha = info.channels === 4;
  invariant(info.channels >= 3, 'Not an image buffer!');

  const buckets = new Map<
    string,
    { count: number; maxSaturation: number; rSum: number; gSum: number; bSum: number }
  >();

  // For each pixel in buffer, process it
  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;

    // Skip ~transparent colors
    const alpha = hasAlpha ? (data[index + 3] ?? 0) : 255;
    if (alpha < 10) {
      continue;
    }

    const color = { b, g, r };

    // Skip colors outside our lightness thresholds (no super dark, no super light)
    const lightness = luminance(color);
    if (lightness < minLuminance || lightness > maxLuminance) {
      continue;
    }

    // Scale down color to smaller range for comparison
    const { saturation } = rgbToHsl(color);
    const quantized = {
      b: quantizeChannel(b, bucketSize),
      g: quantizeChannel(g, bucketSize),
      r: quantizeChannel(r, bucketSize),
    };
    const key = `${quantized.r}-${quantized.g}-${quantized.b}`;

    // Count number of times we've seen this color, and take max saturation
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

  // Average the colors in our quantized buckets, and score by max saturation and how often we've
  // seen this color
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

  // Sort by score of max saturation & count, and push on all those that are sufficiently different
  // from one another
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
    if (selected.length >= 4) {
      break;
    }
  }

  return selected.map((candidate) => candidate.color);
}

function getDominantRgb(stats: Stats): Rgb | null {
  if (stats.dominant && typeof stats.dominant.r === 'number') {
    return {
      b: clampChannel(stats.dominant.b),
      g: clampChannel(stats.dominant.g),
      r: clampChannel(stats.dominant.r),
    };
  }
  return null;
}

function getMeanRgb(stats: Stats): Rgb {
  const [rChannel, gChannel, bChannel] = stats.channels;
  invariant(rChannel && gChannel && bChannel, 'Malformed image');
  return {
    b: clampChannel(bChannel.mean),
    g: clampChannel(gChannel.mean),
    r: clampChannel(rChannel.mean),
  };
}

/**
 * Returns an up-to-4-color radial gradient from the processed image URL, and indicator boolean for
 * recommended text color when used on top of the gradient.
 */
export async function getImageGradientInformationFromUrl(
  url: string,
): Promise<ImageGradientInformation> {
  try {
    // Fetch image, convert to buffer + stats
    const imageResponse = await fetch(url);
    invariant(imageResponse.ok, `Couldn't fetch image: ${imageResponse.status}`);
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const stats = await sharp(buffer).stats();

    // Get vibrant colors, adjusting for mid luminence + more saturated colors
    const vibrantColors = await getVibrantColors(buffer);
    const fallbackColor = getDominantRgb(stats) ?? getMeanRgb(stats);

    // Get a 4 color radial stack, potentially falling back to the dominant color
    const colors = ensureQuadColorArray(vibrantColors, fallbackColor);
    return {
      backgroundGradient: buildRadialGradient(colors),
      contrastSetting: contrastSettingForGradient(colors),
    };
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
