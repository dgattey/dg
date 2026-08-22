import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const foliageDir = join(__dirname, '../foliage');
const cssPath = join(__dirname, '../greenhouse.module.css');

describe('greenhouse chrome', () => {
  it('ships four keyed cutouts under the accepted transfer budget', () => {
    const files = readdirSync(foliageDir);
    const avifs = files.filter((name) => name.endsWith('-1024.avif'));
    expect(avifs.sort()).toEqual([
      'bop-1024.avif',
      'calathea-1024.avif',
      'monstera-1024.avif',
      'nerve-1024.avif',
    ]);
    expect(files.some((name) => name.startsWith('home-frame'))).toBe(false);
    const desktopBytes = avifs.reduce(
      (sum, name) => sum + statSync(join(foliageDir, name)).size,
      0,
    );
    expect(desktopBytes).toBeLessThan(240 * 1024);
    for (const name of avifs) {
      expect(statSync(join(foliageDir, name)).size).toBeGreaterThan(20 * 1024);
      expect(statSync(join(foliageDir, name)).size).toBeLessThan(90 * 1024);
    }
  });

  it('does not ship a glass raster or punched plant plate', () => {
    const css = readFileSync(cssPath, 'utf8');
    expect(css).not.toContain('atmosphere/glass.webp');
    expect(css).not.toContain('.homeFrame');
    expect(css).toContain('--greenhouse-wash');
    expect(css).toContain('--greenhouse-gutter');
    expect(css).toContain('.ribs');
    expect(css).toContain('repeating-linear-gradient');
  });

  it('paints foliage as inert pictures, not SVG uses', () => {
    const plants = readFileSync(join(__dirname, '../GreenhousePlants.tsx'), 'utf8');
    expect(plants).toContain('aria-hidden');
    expect(plants).toContain('.avif');
    expect(plants).toContain('fetchPriority="low"');
    expect(plants).not.toContain('<use');
    expect(plants).not.toContain('preserveAspectRatio="none"');
  });
});
