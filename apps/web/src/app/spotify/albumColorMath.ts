export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type Hsl = {
  h: number;
  s: number;
  l: number;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Converts RGB (0-255 channels) to HSL (h: 0-360, s: 0-1, l: 0-1).
 */
export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, l, s: 0 };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h: number;
  switch (max) {
    case red:
      h = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
      break;
    case green:
      h = ((blue - red) / delta + 2) / 6;
      break;
    default:
      h = ((red - green) / delta + 4) / 6;
  }

  return { h: h * 360, l, s };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const channel = (offset: number) => {
    const k = (offset + h / 30) % 12;
    return 255 * (l - (chroma / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return { b: channel(4), g: channel(8), r: channel(0) };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** Mixes in gamma-encoded sRGB, the space browsers interpolate gradients and composite layers in. */
export function mixRgb(top: Rgb, bottom: Rgb, topWeight: number): Rgb {
  const mix = (a: number, b: number) => a * topWeight + b * (1 - topWeight);
  return { b: mix(top.b, bottom.b), g: mix(top.g, bottom.g), r: mix(top.r, bottom.r) };
}

export function hueDistance(a: number, b: number): number {
  const distance = Math.abs(a - b) % 360;
  return distance > 180 ? 360 - distance : distance;
}
