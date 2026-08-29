import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { PAPER_INK_TONES, PAPER_TONES, type PaperTone } from '../types';

const collageCss = readFileSync(join(__dirname, '..', 'collage.css'), 'utf8');
const paperCss = readFileSync(join(__dirname, '..', 'paper.module.css'), 'utf8');
const INK_COLORS: readonly [string, string] = ['#1d1a15', '#1d1a15'];

function readSchemeColors(token: string): readonly [string, string] {
  const match = new RegExp(
    `--${token}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`,
    'i',
  ).exec(collageCss);
  invariant(match?.[1] && match[2], `Missing light-dark colors for ${token}`);
  return [match[1], match[2]];
}

function luminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi);
  invariant(channels?.length === 3, `Invalid hex color ${hex}`);
  const [red = 0, green = 0, blue = 0] = channels.map(
    (channel) => Number.parseInt(channel, 16) / 255,
  );
  const linear = [red, green, blue].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function usesInk(tone: PaperTone): boolean {
  return tone in PAPER_INK_TONES;
}

describe('collage token contrast', () => {
  it.each(PAPER_TONES)('%s keeps normal text at 4.5:1 in both color schemes', (tone) => {
    const backgrounds = readSchemeColors(tone);
    const foregrounds = usesInk(tone) ? INK_COLORS : readSchemeColors('cream');
    const className = `tone${tone[0]?.toUpperCase()}${tone.slice(1)}`;
    const foregroundToken = usesInk(tone) ? 'ink-on-cream' : 'cream';

    expect(paperCss).toContain(`.${className} {\n  --pc: var(--${tone});\n  --on: var(--${foregroundToken});`);
    expect(contrastRatio(backgrounds[0], foregrounds[0])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(backgrounds[1], foregrounds[1])).toBeGreaterThanOrEqual(4.5);
  });
});
