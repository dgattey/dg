import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const COLLAGE_DIR = path.join(__dirname, '..');

function gzipBytes(filePath: string): number {
  return gzipSync(readFileSync(filePath)).length;
}

describe('collage asset budget', () => {
  it('keeps grain texture under 30 KB raw', () => {
    const grainPath = path.join(COLLAGE_DIR, 'img/grain.png');
    expect(readFileSync(grainPath).length).toBeLessThanOrEqual(30 * 1024);
  });

  it('keeps cut-out shape source under 12 KB gzipped', () => {
    const shapesPath = path.join(COLLAGE_DIR, 'cutOutShapes.ts');
    expect(gzipBytes(shapesPath)).toBeLessThanOrEqual(12 * 1024);
  });

  it('keeps shared collage stylesheet under 25 KB gzipped', () => {
    const cssPath = path.join(COLLAGE_DIR, 'collage.css');
    expect(gzipBytes(cssPath)).toBeLessThanOrEqual(25 * 1024);
  });
});
