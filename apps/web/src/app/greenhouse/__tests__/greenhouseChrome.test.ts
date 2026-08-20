import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

describe('greenhouse chrome', () => {
  it('keeps painterly foliage sprites under the transfer budget', () => {
    const dir = join(__dirname, '../foliage');
    const files = readdirSync(dir).filter((name) => name.endsWith('.webp'));
    expect(files.length).toBeGreaterThanOrEqual(4);
    const sprites = files.filter((name) => name !== 'home-frame.webp');
    const spriteBytes = sprites.reduce((sum, name) => sum + statSync(join(dir, name)).size, 0);
    expect(spriteBytes).toBeLessThan(175 * 1024);
    expect(files).toContain('home-frame.webp');
    expect(files.some((name) => name.startsWith('frame-'))).toBe(false);
    expect(statSync(join(dir, 'home-frame.webp')).size).toBeLessThan(130 * 1024);
    expect(statSync(join(dir, 'home-frame.webp')).size).toBeGreaterThan(40 * 1024);
  });

  it('keeps the glass atmosphere raster small', () => {
    const glass = join(__dirname, '../atmosphere/glass.webp');
    expect(statSync(glass).size).toBeLessThan(80 * 1024);
  });

  it('does not use light-dark in the CSS module (LightningCSS invalidates it)', () => {
    const css = readFileSync(join(__dirname, '../greenhouse.module.css'), 'utf8');
    expect(css).not.toContain('light-dark(');
    expect(css).toContain('--greenhouse-wash');
    expect(css).toContain('./atmosphere/glass.webp');
    expect(css).toContain('.canopy');
    expect(css).toContain('.shaft');
    expect(css).toContain('.ribs');
    expect(css).toContain('.dapple');
    expect(css).toContain('repeating-linear-gradient');
    expect(css).not.toContain('#7f9b6c');
    expect(css).not.toContain('#90ae7a');
    expect(css).not.toContain('#e2d4b0');
    expect(css).toContain('.homeFrame');
    expect(css).toContain('object-fit: cover');
    expect(css).not.toContain('mask-composite');
    expect(css).not.toContain('.frameLeft');
  });

  it('paints foliage as inert images, not stretched SVG uses', () => {
    const plants = readFileSync(join(__dirname, '../GreenhousePlants.tsx'), 'utf8');
    expect(plants).toContain('aria-hidden');
    expect(plants).toContain('.webp');
    expect(plants).not.toContain('<use');
    expect(plants).not.toContain('preserveAspectRatio="none"');
  });

  it('paints the home plant frame as one inert photograph', () => {
    const frame = readFileSync(join(__dirname, '../GreenhousePlantFrame.tsx'), 'utf8');
    expect(frame).toContain('aria-hidden');
    expect(frame).toContain('home-frame.webp');
    expect(frame).not.toContain('frame-left.webp');
    expect(frame).not.toContain('<use');
  });
});
