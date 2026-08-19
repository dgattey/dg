import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('greenhouse sprites', () => {
  it('keeps symbol path data under the 40 KB craft budget', () => {
    const source = readFileSync(join(__dirname, '../GreenhouseSpriteDefs.tsx'), 'utf8');
    expect(Buffer.byteLength(source, 'utf8')).toBeLessThan(40 * 1024);
    expect(Buffer.byteLength(source, 'utf8')).toBeGreaterThan(8 * 1024);
  });

  it('ships as inline symbols, not a network image', () => {
    const source = readFileSync(join(__dirname, '../GreenhouseSpriteDefs.tsx'), 'utf8');
    expect(source).toContain('<symbol');
    expect(source).not.toMatch(/https?:\/\//);
  });

  it('does not stretch plant overlays', () => {
    const plants = readFileSync(join(__dirname, '../GreenhousePlants.tsx'), 'utf8');
    expect(plants).toContain('preserveAspectRatio="xMidYMid meet"');
    expect(plants).not.toContain('preserveAspectRatio="none"');
  });

  it('does not use light-dark in the CSS module (LightningCSS invalidates it)', () => {
    const css = readFileSync(join(__dirname, '../greenhouse.module.css'), 'utf8');
    expect(css).not.toContain('light-dark(');
    expect(css).toContain('--greenhouse-wash');
  });
});
