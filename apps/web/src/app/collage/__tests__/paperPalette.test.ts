import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NIGHT_PAPER, PAPER_PALETTE } from '../paperPalette';

const collageCss = readFileSync(join(__dirname, '../collage.css'), 'utf8');

/** Day and night values of a `.collageRoot` token declared as `light-dark(day, night)`. */
function tokenSchemes(name: string) {
  const match = collageCss.match(
    new RegExp(`--${name}: light-dark\\((#[0-9a-f]+), (#[0-9a-f]+)\\)`),
  );
  if (!match) {
    throw new Error(`collage.css has no light-dark --${name} token`);
  }
  return { day: match[1], night: match[2] };
}

describe('PAPER_PALETTE', () => {
  it.each(Object.entries(PAPER_PALETTE))('matches the day-scheme --%s token', (name, hex) => {
    expect(tokenSchemes(name).day).toBe(hex);
  });

  it('matches the night-scheme --paper token', () => {
    expect(tokenSchemes('paper').night).toBe(NIGHT_PAPER);
  });
});
