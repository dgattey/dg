import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const foliageDir = join(__dirname, '../foliage');
const atmosphereDir = join(__dirname, '../atmosphere');
const cssPath = join(__dirname, '../greenhouse.module.css');

describe('greenhouse chrome', () => {
  it('ships a landscape plate and a portrait plate', () => {
    const landscape = join(atmosphereDir, 'back-plate-1536.avif');
    const mid = join(atmosphereDir, 'back-plate-960.avif');
    const portrait = join(atmosphereDir, 'back-plate-portrait.avif');
    expect(existsSync(landscape)).toBe(true);
    expect(existsSync(mid)).toBe(true);
    expect(existsSync(portrait)).toBe(true);
    expect(existsSync(join(atmosphereDir, 'depth-plate.avif'))).toBe(false);
    expect(statSync(landscape).size).toBeGreaterThan(70 * 1024);
    expect(statSync(landscape).size).toBeLessThan(115 * 1024);
    expect(statSync(portrait).size).toBeGreaterThan(40 * 1024);
    expect(statSync(portrait).size).toBeLessThan(100 * 1024);
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toContain('object-position: 62% 100%');
    expect(css).not.toContain('blur(22px)');
    expect(css).not.toContain('.mullions');
  });

  it('ships independently anchored edge strips and a tiled bottom band', () => {
    expect(statSync(join(foliageDir, 'edge-left-1536.avif')).size).toBeGreaterThan(30 * 1024);
    expect(statSync(join(foliageDir, 'edge-left-1536.avif')).size).toBeLessThan(70 * 1024);
    expect(statSync(join(foliageDir, 'edge-right-1536.avif')).size).toBeGreaterThan(30 * 1024);
    expect(statSync(join(foliageDir, 'edge-right-1536.avif')).size).toBeLessThan(70 * 1024);
    expect(statSync(join(foliageDir, 'edge-left-900.avif')).size).toBeGreaterThan(20 * 1024);
    expect(statSync(join(foliageDir, 'edge-right-900.avif')).size).toBeGreaterThan(20 * 1024);
    expect(statSync(join(foliageDir, 'bottom-band-1536.avif')).size).toBeGreaterThan(30 * 1024);
    expect(statSync(join(foliageDir, 'bottom-band-1024.avif')).size).toBeGreaterThan(20 * 1024);
    expect(existsSync(join(foliageDir, 'thicket-1536.avif'))).toBe(false);
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toContain('clamp(180px, 20vw, 440px)');
    expect(css).toContain('clamp(90px, 14vw, 140px)');
    expect(css).toContain('repeat-x');
    expect(css).toContain('object-position: bottom left');
    expect(css).toContain('object-position: bottom right');
  });

  it('keeps four keyed cutouts for the corner layer and other surfaces', () => {
    const files = readdirSync(foliageDir);
    const avifs = files.filter((name) => name.endsWith('-1024.avif') && !name.startsWith('bottom'));
    expect(avifs.sort()).toEqual([
      'bop-1024.avif',
      'calathea-1024.avif',
      'monstera-1024.avif',
      'nerve-1024.avif',
    ]);
    expect(files.some((name) => name.startsWith('home-frame'))).toBe(false);
  });

  it('does not ship the crushed glass raster or a punched plant plate', () => {
    const css = readFileSync(cssPath, 'utf8');
    expect(css).not.toContain('atmosphere/glass.webp');
    expect(css).not.toContain('.homeFrame');
    expect(css).toContain('--greenhouse-wash');
    expect(css).toContain('--greenhouse-gutter');
    expect(css).toContain('section:has([data-greenhouse-frame])');
  });

  it('keeps flag evaluation behind Suspense on the surface shell', () => {
    const surface = readFileSync(join(__dirname, '../GreenhouseSurface.tsx'), 'utf8');
    expect(surface).toContain('export function GreenhouseSurface');
    expect(surface).not.toContain('export async function GreenhouseSurface');
    expect(surface).toContain('<Suspense fallback={null}>');
    expect(surface).toContain('async function GreenhouseSurfaceSwitch');
    expect(surface).toContain('await interactiveRedesign()');
  });

  it('resolves foliage image imports through the Jest stub', async () => {
    const foliage = await import('../GreenhouseFoliage');
    expect(foliage.GreenhouseFoliage).toEqual(expect.any(Function));
    expect(foliage.GreenhouseBackPlate).toEqual(expect.any(Function));
  });

  it('paints foliage as inert pictures, not SVG uses', () => {
    const plants = readFileSync(join(__dirname, '../GreenhousePlants.tsx'), 'utf8');
    const foliage = readFileSync(join(__dirname, '../GreenhouseFoliage.tsx'), 'utf8');
    expect(plants).toContain('aria-hidden');
    expect(plants).toContain('.avif');
    expect(plants).toContain('fetchPriority="low"');
    expect(foliage).toContain('fetchPriority="high"');
    expect(foliage).toContain('fetchPriority="low"');
    expect(foliage).toContain('(max-width: 767px)');
    expect(plants).not.toContain('<use');
    expect(plants).not.toContain('preserveAspectRatio="none"');
  });
});
