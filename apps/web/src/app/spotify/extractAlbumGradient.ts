import {
  clamp,
  contrastRatio,
  type Hsl,
  hslToRgb,
  hueDistance,
  mixRgb,
  type Rgb,
  rgbToHsl,
} from './albumColorMath';

export type AlbumInk = 'dark' | 'light';

/**
 * Everything the now-playing card paints from its album art. `mesh` is the bare
 * color field (used for the glow around the card), `surface` adds the text scrim
 * on top of it, and `ink` names the text color that clears AA contrast on both.
 */
export type AlbumColors = {
  ink: AlbumInk;
  mesh: string;
  surface: string;
};

export const ALBUM_INK_COLORS: Record<AlbumInk, Rgb> = {
  dark: { b: 21, g: 26, r: 29 },
  light: { b: 242, g: 250, r: 253 },
};

const SCRIMS: Record<AlbumInk, string> = {
  dark: 'linear-gradient(to bottom, rgb(253 250 242 / 0.28), rgb(253 250 242 / 0.08))',
  light: 'linear-gradient(to bottom, rgb(14 12 18 / 0.24), rgb(14 12 18 / 0.06))',
};

const OPTIONS = {
  hueBucketSize: 20,
  lightnessBands: 5,
  lightnessStep: 0.02,
  maxAdjustPasses: 50,
  minBucketShare: 0.012,
  minContrast: 4.8,
  minHueGap: 28,
  minLightnessGap: 0.3,
  neutralAccents: { alpha: 0.55, count: 2, reach: 48 },
  neutralChroma: 0.12,
  /** Covers with more neutral pixels than this keep their neutral as the base. */
  neutralCoverShare: 0.65,
  sampleSize: 40,
  vivid: { lightnessMax: 0.68, lightnessMin: 0.32, saturationBoost: 1.25, saturationFloor: 0.65 },
  vividReach: 62,
} as const;

type CoverAnalysis = {
  neutralShare: number;
  neutral: Rgb;
  /** The most chromatic distinct colors on the cover, strongest first. */
  peaks: Array<Hsl>;
};

/**
 * Splits pixels into neutrals (whites, creams, grays, blacks) and chroma peaks:
 * hue and lightness buckets ranked by how colorful and how common they are.
 */
function analyzeCover(data: Uint8ClampedArray): CoverAnalysis {
  const { hueBucketSize, lightnessBands, minBucketShare, minHueGap, minLightnessGap } = OPTIONS;
  const buckets = new Map<
    string,
    { chroma: number; count: number; l: number; s: number; x: number; y: number }
  >();
  const neutralSum = { b: 0, g: 0, r: 0 };
  let neutralCount = 0;
  let total = 0;

  for (let index = 0; index < data.length; index += 4) {
    if ((data[index + 3] ?? 0) < 10) {
      continue;
    }
    const rgb = { b: data[index + 2] ?? 0, g: data[index + 1] ?? 0, r: data[index] ?? 0 };
    const hsl = rgbToHsl(rgb);
    const chroma = hsl.s * (1 - Math.abs(2 * hsl.l - 1));
    total += 1;

    if (chroma < OPTIONS.neutralChroma) {
      neutralCount += 1;
      neutralSum.r += rgb.r;
      neutralSum.g += rgb.g;
      neutralSum.b += rgb.b;
      continue;
    }

    const hueBucket = Math.round(hsl.h / hueBucketSize) * hueBucketSize;
    const lightnessBand = Math.min(Math.floor(hsl.l * lightnessBands), lightnessBands - 1);
    const key = `${hueBucket}-${lightnessBand}`;
    const radians = (hsl.h * Math.PI) / 180;
    const bucket = buckets.get(key) ?? { chroma: 0, count: 0, l: 0, s: 0, x: 0, y: 0 };
    bucket.chroma += chroma;
    bucket.count += 1;
    bucket.l += hsl.l;
    bucket.s += hsl.s;
    bucket.x += Math.cos(radians);
    bucket.y += Math.sin(radians);
    buckets.set(key, bucket);
  }

  const ranked = Array.from(buckets.values())
    .filter(({ count }) => count >= total * minBucketShare)
    .map(({ chroma, count, l, s, x, y }) => ({
      color: { h: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360, l: l / count, s: s / count },
      score: (chroma / count) * count ** 0.5,
    }))
    .sort((a, b) => b.score - a.score);

  const peaks: Array<Hsl> = [];
  for (const { color } of ranked) {
    const isDistinct = peaks.every(
      (peak) =>
        hueDistance(peak.h, color.h) >= minHueGap || Math.abs(peak.l - color.l) >= minLightnessGap,
    );
    if (isDistinct) {
      peaks.push(color);
    }
    if (peaks.length === 4) {
      break;
    }
  }

  const neutral =
    neutralCount > 0
      ? {
          b: neutralSum.b / neutralCount,
          g: neutralSum.g / neutralCount,
          r: neutralSum.r / neutralCount,
        }
      : { b: 128, g: 128, r: 128 };

  return { neutral, neutralShare: total > 0 ? neutralCount / total : 1, peaks };
}

function vivid(color: Hsl): Hsl {
  const { lightnessMax, lightnessMin, saturationBoost, saturationFloor } = OPTIONS.vivid;
  return {
    h: color.h,
    l: clamp(color.l, lightnessMin, lightnessMax),
    s: clamp(Math.max(saturationFloor, color.s * saturationBoost), 0, 1),
  };
}

const CORNERS = ['top left', 'top right', 'bottom right', 'bottom left'] as const;

/**
 * Corner glows over a base. Vivid covers fill all four corners and a diagonal base
 * from their chroma peaks. Neutral covers keep their neutral as a flat base and only
 * tint two corners with the accents they really have.
 */
type Mesh = {
  accentAlpha: number;
  accentCorners: ReadonlyArray<(typeof CORNERS)[number]>;
  accentReach: number;
  accents: Array<Hsl>;
  base: Array<Hsl>;
};

function meshForCover({ neutral, neutralShare, peaks }: CoverAnalysis): Mesh {
  const [seed] = peaks;
  if (!seed || neutralShare > OPTIONS.neutralCoverShare) {
    const { alpha, count, reach } = OPTIONS.neutralAccents;
    return {
      accentAlpha: alpha,
      accentCorners: ['top right', 'bottom left'],
      accentReach: reach,
      accents: peaks.slice(0, count).map(vivid),
      base: [rgbToHsl(neutral)],
    };
  }

  const shifts = [24, -24, 48];
  const filled = [...peaks];
  while (filled.length < 4) {
    filled.push({ ...seed, h: (seed.h + (shifts[filled.length - 1] ?? 0) + 360) % 360 });
  }
  const accents = filled.map(vivid);
  return {
    accentAlpha: 1,
    accentCorners: CORNERS,
    accentReach: OPTIONS.vividReach,
    accents,
    base: [accents[0] ?? seed, accents[2] ?? seed],
  };
}

type Probe = { rgb: Rgb; sources: Array<number> };

/**
 * Colors text can land on: each base stop, each accent composited over each base
 * stop, and the sRGB midpoint of every pair, since a blend of two passing colors
 * can still dip below both.
 */
function probesFor(mesh: Mesh): Array<Probe> {
  const baseRgb = mesh.base.map(hslToRgb);
  const points: Array<Probe> = baseRgb.map((rgb, index) => ({ rgb, sources: [index] }));
  mesh.accents.forEach((accent, accentIndex) => {
    const accentRgb = hslToRgb(accent);
    baseRgb.forEach((base, baseIndex) => {
      points.push({
        rgb: mixRgb(accentRgb, base, mesh.accentAlpha),
        sources: [mesh.base.length + accentIndex, baseIndex],
      });
    });
  });
  const midpoints: Array<Probe> = [];
  points.forEach((a, i) => {
    for (const b of points.slice(i + 1)) {
      midpoints.push({ rgb: mixRgb(a.rgb, b.rgb, 0.5), sources: [...a.sources, ...b.sources] });
    }
  });
  return [...points, ...midpoints];
}

/**
 * Nudges failing stops lighter (under dark ink) or darker (under light ink) at their
 * own hue and saturation until every probe clears the contrast target.
 */
function fitMeshToInk(mesh: Mesh, ink: AlbumInk): { mesh: Mesh; shift: number } {
  const inkRgb = ALBUM_INK_COLORS[ink];
  const direction = ink === 'dark' ? 1 : -1;
  const stops = [...mesh.base, ...mesh.accents].map((stop) => ({ ...stop }));
  const split = (): Mesh => ({
    ...mesh,
    accents: stops.slice(mesh.base.length),
    base: stops.slice(0, mesh.base.length),
  });
  let shift = 0;

  for (let pass = 0; pass < OPTIONS.maxAdjustPasses; pass += 1) {
    const failing = new Set(
      probesFor(split())
        .filter(({ rgb }) => contrastRatio(rgb, inkRgb) < OPTIONS.minContrast)
        .flatMap(({ sources }) => sources),
    );
    if (failing.size === 0) {
      break;
    }
    for (const index of failing) {
      const stop = stops[index];
      if (stop) {
        const next = clamp(stop.l + direction * OPTIONS.lightnessStep, 0, 1);
        shift += Math.abs(next - stop.l);
        stop.l = next;
      }
    }
  }
  return { mesh: split(), shift };
}

const toHsl = ({ h, s, l }: Hsl, alpha = 1) =>
  `hsl(${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}% / ${alpha})`;

function meshToCss(mesh: Mesh): string {
  const glows = mesh.accents.map((accent, index) => {
    const corner = mesh.accentCorners[index] ?? 'center';
    return `radial-gradient(circle at ${corner}, ${toHsl(accent, mesh.accentAlpha)} 0%, transparent ${mesh.accentReach}%)`;
  });
  const [first, second] = mesh.base;
  const base = first ? `linear-gradient(135deg, ${toHsl(first)}, ${toHsl(second ?? first)})` : '';
  return [...glows, base].filter(Boolean).join(', ');
}

/**
 * Builds the card's vivid mesh and text ink from sampled RGBA pixels. The ink that
 * needs the smaller lightness correction wins, so a bright cyan cover keeps its sky
 * and takes dark text rather than darkening into navy.
 */
export function extractAlbumColorsFromImageData(data: Uint8ClampedArray): AlbumColors {
  const mesh = meshForCover(analyzeCover(data));
  const dark = fitMeshToInk(mesh, 'dark');
  const light = fitMeshToInk(mesh, 'light');
  const ink: AlbumInk = light.shift < dark.shift ? 'light' : 'dark';
  const css = meshToCss((ink === 'dark' ? dark : light).mesh);
  return { ink, mesh: css, surface: `${SCRIMS[ink]}, ${css}` };
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
 * Downsamples album art in a canvas and extracts the card colors from it.
 * Spotify CDN serves CORS headers, so canvas pixel reads succeed with crossOrigin=anonymous.
 */
export async function extractAlbumColorsFromUrl(url: string): Promise<AlbumColors | null> {
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
      return null;
    }
    context.drawImage(image, 0, 0, width, height);
    return extractAlbumColorsFromImageData(context.getImageData(0, 0, width, height).data);
  } catch {
    return null;
  }
}
