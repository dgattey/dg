import type { StructureViolation } from './check-structure.js';

export function isTestFile(relPath: string): boolean {
  return (
    relPath.includes('__tests__/') ||
    /\.test\.(ts|tsx)$/.test(relPath) ||
    relPath.endsWith('jest.config.ts')
  );
}

export function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function stripCssComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

export type CssRule = {
  body: string;
  index: number;
  media: string | null;
  selectors: Array<string>;
};

/** Flat list of style rules, each tagged with the `@media` prelude it sits in. */
export function cssRules(content: string): Array<CssRule> {
  const source = stripCssComments(content);
  const rules: Array<CssRule> = [];
  const media: Array<string | null> = [];
  let start = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '{') {
      const prelude = source.slice(start, i).trim();
      const close = prelude.startsWith('@') ? -1 : source.indexOf('}', i);
      if (close === -1) {
        media.push(prelude.startsWith('@media') ? prelude : (media.at(-1) ?? null));
      } else {
        rules.push({
          body: source.slice(i + 1, close),
          index:
            start + (source.slice(start, i).length - source.slice(start, i).trimStart().length),
          media: media.at(-1) ?? null,
          selectors: prelude.split(',').map((selector) => selector.trim().replace(/\s+/g, ' ')),
        });
        i = close;
      }
      start = i + 1;
    } else if (char === '}') {
      media.pop();
      start = i + 1;
    } else if (char === ';' && source.slice(start, i).trim().startsWith('@')) {
      start = i + 1;
    }
  }
  return rules;
}

export const declaration = (body: string, property: string): string | undefined =>
  new RegExp(`(?:^|[;\\s])${property}\\s*:([^;]+)`).exec(body)?.[1]?.trim();

const topPaddingPx = (body: string): number | null => {
  const raw = declaration(body, 'padding-top') ?? declaration(body, 'padding')?.split(/\s+/)[0];
  const m = raw ? /^(\d+(?:\.\d+)?)px$/.exec(raw) : null;
  return m ? Number(m[1]) : null;
};

/** Enforces the sticky footer curtain reveal, straddling Now strip, and symmetrical footer spacing. */
export function checkFooterCurtainReveal(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const collageFile = 'apps/web/src/app/collage/collage.css';
  const chromeFile = 'apps/web/src/app/collage/chrome.css';
  const collage = cssFiles.get(collageFile);
  const chrome = cssFiles.get(chromeFile);
  if (!collage && !chrome) return [];
  const violations: Array<StructureViolation> = [];
  const flag = (file: string, content: string, index: number, message: string) =>
    violations.push({ file, line: lineAt(content, index), message, rule: 'css-footer-curtain' });

  let sheetZ = 2;
  let footerZ = 1;
  if (collage) {
    if (!/@property\s+--footer-progress\s*\{[^}]*syntax:\s*"<number>"/.test(collage)) {
      flag(
        collageFile,
        collage,
        0,
        'Declare `@property --footer-progress` with `syntax: "<number>"`',
      );
    }
    for (const rule of cssRules(collage)) {
      if (!rule.media && rule.selectors.includes('.collageRoot')) {
        const ov = declaration(rule.body, 'overflow') ?? declaration(rule.body, 'overflow-y');
        if (ov && /^(?:hidden|auto|scroll)\b/.test(ov)) {
          flag(
            collageFile,
            collage,
            rule.index,
            '`.collageRoot` must not set overflow hidden/auto/scroll, which traps `position: sticky` on `.chrome__footer`',
          );
        }
      }
      if (!rule.media && rule.selectors.includes('.collageSheet')) {
        sheetZ = Number(declaration(rule.body, 'z-index'));
        if (
          declaration(rule.body, 'position') !== 'relative' ||
          !rule.body.includes('--footer-progress')
        ) {
          flag(
            collageFile,
            collage,
            rule.index,
            '`.collageSheet` must keep `position: relative` and drive `--sheet-inset`/`--sheet-radius` from `var(--footer-progress)`',
          );
        }
      }
    }
  }
  if (chrome) {
    for (const rule of cssRules(chrome)) {
      const mobile = Boolean(rule.media?.includes('max-width'));
      if (!rule.media && rule.selectors.includes('.chrome__footer')) {
        footerZ = Number(declaration(rule.body, 'z-index'));
        if (
          declaration(rule.body, 'position') !== 'sticky' ||
          declaration(rule.body, 'bottom') !== '0' ||
          !(footerZ < sheetZ)
        ) {
          flag(
            chromeFile,
            chrome,
            rule.index,
            '`.chrome__footer` must keep `position: sticky; bottom: 0` with `z-index` below `.collageSheet`',
          );
        }
      }
      if (rule.selectors.includes('.chrome__footer')) {
        const pt = topPaddingPx(rule.body);
        if (pt !== null && pt < (mobile ? 56 : 64)) {
          flag(
            chromeFile,
            chrome,
            rule.index,
            `\`.chrome__footer\` top padding (${pt}px) must stay >= ${mobile ? 56 : 64}px so the straddling Now strip clears the footer content`,
          );
        }
      }
      if (!rule.media && rule.selectors.includes('.chrome__nowWrap')) {
        const nowZ = Number(declaration(rule.body, 'z-index'));
        if (declaration(rule.body, 'height') !== '0' || !(nowZ > sheetZ)) {
          flag(
            chromeFile,
            chrome,
            rule.index,
            '`.chrome__nowWrap` must keep `height: 0` and `z-index` above `.collageSheet` so the Now strip straddles the sheet seam',
          );
        }
      }
      if (rule.selectors.includes('.chrome__footerBody')) {
        const pt = topPaddingPx(rule.body);
        if (pt !== null && pt < (mobile ? 20 : 24)) {
          flag(
            chromeFile,
            chrome,
            rule.index,
            `\`.chrome__footerBody\` top padding (${pt}px) must stay >= ${mobile ? 20 : 24}px`,
          );
        }
      }
      if (rule.selectors.includes('.chrome__colophon')) {
        const mt = Number(
          /^(\d+(?:\.\d+)?)px$/.exec(declaration(rule.body, 'margin-top') ?? '')?.[1],
        );
        if (Number.isFinite(mt) && mt < (mobile ? 32 : 48)) {
          flag(
            chromeFile,
            chrome,
            rule.index,
            `\`.chrome__colophon\` margin-top (${mt}px) must stay >= ${mobile ? 32 : 48}px to match the top spacing under the Now strip`,
          );
        }
      }
      if (
        rule.selectors.includes('.chrome__elsewhereLedger') &&
        declaration(rule.body, 'border-bottom')
      ) {
        flag(
          chromeFile,
          chrome,
          rule.index,
          '`.chrome__elsewhereLedger` must not set `border-bottom` after the last social link',
        );
      }
    }
  }
  return violations;
}

const PAGE_TITLE_THEN_PARAGRAPH =
  /<CutLetters\b[^>]*\bclassName="[^"]*\bcollagePageTitle\b[^"]*"[^>]*\/>\s*(?:\{[^}]*\}\s*)?<p\b/g;

/** Page titles stand alone; a paragraph set right under one reads as a subtitle. */
export function checkNoPageSubtitles(
  webSources: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of webSources) {
    if (!file.endsWith('.tsx') || isTestFile(file)) {
      continue;
    }
    for (const match of content.matchAll(PAGE_TITLE_THEN_PARAGRAPH)) {
      violations.push({
        file,
        line: lineAt(content, match.index),
        message: 'Page titles have no subtitle; drop the paragraph under the CutLetters title',
        rule: 'no-page-subtitle',
      });
    }
  }
  return violations;
}
