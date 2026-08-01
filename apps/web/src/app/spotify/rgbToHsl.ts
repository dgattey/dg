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
