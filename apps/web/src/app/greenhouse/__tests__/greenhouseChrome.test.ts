import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const foliageDir = join(__dirname, '../foliage');
const atmosphereDir = join(__dirname, '../atmosphere');
const cssPath = join(__dirname, '../greenhouse.module.css');

const CUTOUT_1024 = [
  'bop-1024.avif',
  'calathea-1024.avif',
  'monstera-1024.avif',
  'nerve-1024.avif',
] as const;

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

  it('does not ship a tiled band or cropped edge strip', () => {
    const files = readdirSync(foliageDir);
    expect(files.some((name) => name.startsWith('bottom-band'))).toBe(false);
    expect(files.some((name) => name.startsWith('edge-left'))).toBe(false);
    expect(files.some((name) => name.startsWith('edge-right'))).toBe(false);
    expect(files.some((name) => name.startsWith('thicket'))).toBe(false);
    expect(files.some((name) => name.startsWith('home-frame'))).toBe(false);
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toContain('clamp(180px, 20vw, 440px)');
    expect(css).toContain('padding-inline: 1rem');
    expect(css).toContain('animation-timeline: scroll()');
    expect(css).toContain('animation-timeline: view()');
    expect(css).toContain('overflow: visible');
    expect(css).not.toContain('clip-path');
    expect(css).not.toContain('repeat-x');
    expect(css).not.toContain('mask-image');
    expect(css).not.toContain('--greenhouse-band');
    expect(css).toContain('.bottomStack');
    expect(css).toContain('.sideStack');
  });

  it('keeps four keyed cutouts and stays under the desktop chrome budget', () => {
    const files = readdirSync(foliageDir);
    const avifs = files.filter((name) => name.endsWith('-1024.avif'));
    expect(avifs.sort()).toEqual([...CUTOUT_1024]);
    const plate = statSync(join(atmosphereDir, 'back-plate-1536.avif')).size;
    const cutouts = CUTOUT_1024.reduce(
      (sum, name) => sum + statSync(join(foliageDir, name)).size,
      0,
    );
    expect(plate + cutouts).toBeLessThanOrEqual(400 * 1024);
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
    expect(foliage.GreenhouseBackPlate).toEqual(expect.any(Function));
    expect('GreenhouseFoliage' in foliage).toBe(false);
  });

  it('paints foliage as inert pictures, not SVG uses', () => {
    const plants = readFileSync(join(__dirname, '../GreenhousePlants.tsx'), 'utf8');
    const foliage = readFileSync(join(__dirname, '../GreenhouseFoliage.tsx'), 'utf8');
    expect(plants).toContain('aria-hidden');
    expect(plants).toContain('.avif');
    expect(plants).toContain('fetchPriority="low"');
    expect(foliage).toContain('fetchPriority="high"');
    expect(foliage).toContain('(max-width: 767px)');
    expect(foliage).toContain('srcSet');
    expect(foliage).toContain('1536w');
    expect(plants).not.toContain('<use');
    expect(plants).not.toContain('preserveAspectRatio="none"');
  });

  it('keeps only plate, sides, cards, and bottom fringe in the frame', () => {
    const frame = readFileSync(join(__dirname, '../GreenhouseFrame.tsx'), 'utf8');
    const css = readFileSync(cssPath, 'utf8');
    expect(frame).toContain('data-greenhouse-layer="plate"');
    expect(frame).toContain('data-greenhouse-layer="cards"');
    expect(frame).toContain('data-greenhouse-layer="plants"');
    expect(frame).toContain('data-greenhouse-layer="sides"');
    expect(css).not.toContain('.plateTint');
    expect(css).not.toContain('.ribs');
    expect(css).not.toContain('.sun');
    expect(css).not.toContain('.atmosphere');
    expect(css).not.toMatch(/font-size\s*:/);
    expect(css).not.toMatch(/line-height\s*:/);
    expect(css).not.toMatch(/letter-spacing\s*:/);
  });

  it('ships a 1x plate ladder so 2x screens can pick the native source cap', () => {
    expect(existsSync(join(atmosphereDir, 'back-plate-768.avif'))).toBe(true);
    expect(existsSync(join(atmosphereDir, 'back-plate-portrait-768.avif'))).toBe(true);
  });
});
