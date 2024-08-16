/**
 * Converts between an HSL string and its HEX representation.
 */
export function hslToHex(hslString: string): string {
  // Regular expression to extract H, S, and L values
  const hslRegex = /hsl\((?<hue>\d+)deg,\s*(?<saturation>\d+)%,\s(?<lightness>\d+)%,.*\)/;
  const match = hslRegex.exec(hslString);

  if (!match) {
    throw new Error('Invalid HSL string format');
  }

  // Extract values and convert them to integers
  const hue = parseInt(match.groups?.hue ?? '', 10);
  const saturation = parseInt(match.groups?.saturation ?? '', 10) / 100;
  const lightness = parseInt(match.groups?.lightness ?? '', 10) / 100;

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (hue >= 300 && hue < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert RGB to HEX
  const toHex = (value: number): string => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
