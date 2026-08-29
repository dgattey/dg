import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { CUT_OUT_SHAPES } from '../cutOutShapes';

const collageDirectory = join(__dirname, '..');

const PAGE_CSS_FILES = [
  'collage.css',
  'edges.css',
  'paper.module.css',
  'chrome.module.css',
  'HelloSheet.module.css',
  'CutOut.module.css',
  'CutOutSymbols.module.css',
  'CutLetters.module.css',
  'PortraitPrint.module.css',
  'Print.module.css',
] as const;

function gzipSize(value: string): number {
  return gzipSync(value).byteLength;
}

describe('collage asset budgets', () => {
  it('keeps the Hello sheet symbols and CSS within the page budget', () => {
    const symbols = Object.values(CUT_OUT_SHAPES).join('');
    const css = PAGE_CSS_FILES.map((file) =>
      readFileSync(join(collageDirectory, file), 'utf8'),
    ).join('');

    expect(gzipSize(symbols)).toBeLessThanOrEqual(12 * 1024);
    expect(gzipSize(css + symbols)).toBeLessThanOrEqual(25 * 1024);
  });

  it('keeps the shared paper tile and display font within their budgets', () => {
    expect(statSync(join(collageDirectory, 'img/paper.webp')).size).toBeLessThanOrEqual(30 * 1024);
    expect(statSync(join(collageDirectory, 'fonts/Familjen-Grotesk.woff2')).size).toBeLessThanOrEqual(
      25 * 1024,
    );
  });
});
