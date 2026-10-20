import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_DIR = resolve(__dirname, '../..');

const STYLESHEETS = [
  'collage/collage.css',
  'collage/home.css',
  'collage/chrome.css',
  'collage/print.css',
  'music/music.css',
  'dev-console/devConsole.css',
  'layouts/error.css',
] as const;

function readStylesheet(relativePath: (typeof STYLESHEETS)[number]): string {
  return readFileSync(resolve(APP_DIR, relativePath), 'utf8');
}

describe('collage typography, mat, and logo stamp token invariants', () => {
  const collageCss = readStylesheet('collage/collage.css');
  const homeCss = readStylesheet('collage/home.css');
  const chromeCss = readStylesheet('collage/chrome.css');
  const printCss = readStylesheet('collage/print.css');

  it('defines the 8-token typography scale on .collageRoot', () => {
    expect(collageCss).toContain('--type-display: clamp(56px, 11vw, 144px);');
    expect(collageCss).toContain('--type-h1: clamp(44px, 7vw, 88px);');
    expect(collageCss).toContain('--type-h2: clamp(20px, 2.2vw, 24px);');
    expect(collageCss).toContain('--type-h3: 20px;');
    expect(collageCss).toContain('--type-body-lg: clamp(17px, 1.5vw, 20px);');
    expect(collageCss).toContain('--type-body: 16px;');
    expect(collageCss).toContain('--type-label: 16px;');
    expect(collageCss).toContain('--type-meta: 14px;');
  });

  it('defines the two-tier mat and border tokens on .collageRoot and applies 14px to projects and portrait', () => {
    expect(collageCss).toContain('--mat: 10px;');
    expect(collageCss).toContain('--mat-feature: 14px;');
    expect(collageCss).toContain('--mat-radius: 6px;');
    expect(collageCss).toContain('--border-width: 1.5px;');

    expect(homeCss).toMatch(/\.home__framePad\s*\{[^}]*padding:\s*var\(--mat-feature\)/s);
    expect(printCss).toMatch(
      /\.print__halo\s*\{[^}]*inset:\s*calc\(-1\s*\*\s*var\(--mat-feature\)\)/s,
    );
    expect(homeCss).toMatch(/\.home__mapInner\s*\{[^}]*padding:\s*var\(--mat\)/s);
    expect(homeCss).toMatch(/\.home__spotify\s*\{[^}]*--rim:\s*var\(--mat\)/s);
    expect(homeCss).toMatch(/\.home__stravaInner\s*\{[^}]*padding:\s*var\(--mat\)/s);
    expect(homeCss).toMatch(/\.home__projectMetaCard\s*\{[^}]*padding:\s*var\(--mat\)/s);
  });

  it('defines the ink stamp logo tokens with a 3px cream outer ring', () => {
    expect(collageCss).toContain('--logo-fill: var(--ink);');
    expect(collageCss).toContain('--logo-stamp-bg: var(--logo-fill);');
    expect(collageCss).toContain('--logo-stamp-fg: var(--cream);');
    expect(chromeCss).toMatch(/\.chrome__logo\s*\{[^}]*background:\s*var\(--logo-stamp-bg\)/s);
    expect(chromeCss).toMatch(
      /\.chrome__logo\s*\{[^}]*box-shadow:\s*0\s+0\s+0\s+3px\s+var\(--cream\),\s*var\(--shadow\)/s,
    );
  });

  it.each(STYLESHEETS)(
    'uses only --type-* tokens or inherit for font-size and avoids uppercase in %s',
    (relativePath) => {
      const css = readStylesheet(relativePath);
      const fontSizes = Array.from(css.matchAll(/font-size:\s*([^;]+);/g), (match) =>
        match[1]?.trim(),
      );

      for (const value of fontSizes) {
        expect(value).toMatch(/^(var\(--type-[a-z0-9-]+\)|inherit)$/);
      }

      expect(css).not.toMatch(/text-transform:\s*uppercase/i);
    },
  );
});
