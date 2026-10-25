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

/** Enforces the sticky footer curtain reveal and single-property `padding-block` symmetry on `.chrome__footerGrid`. */
export function checkFooterCurtainReveal(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const collageFile = 'apps/web/src/app/collage/collage.css';
  const chromeFile = 'apps/web/src/app/collage/chrome.css';
  const collage = cssFiles.get(collageFile);
  const chrome = cssFiles.get(chromeFile);
  if (!collage || !chrome) return [];

  const sheetRule = cssRules(collage).find(
    (r) => !r.media && r.selectors.includes('.collageSheet'),
  );
  const footerRule = cssRules(chrome).find(
    (r) => !r.media && r.selectors.includes('.chrome__footer'),
  );
  const nowWrapRule = cssRules(chrome).find(
    (r) => !r.media && r.selectors.includes('.chrome__nowWrap'),
  );
  const gridRule = cssRules(chrome).find(
    (r) => !r.media && r.selectors.includes('.chrome__footerGrid'),
  );

  const sheetZ = Number(declaration(sheetRule?.body ?? '', 'z-index'));
  const footerZ = Number(declaration(footerRule?.body ?? '', 'z-index'));
  const nowZ = Number(declaration(nowWrapRule?.body ?? '', 'z-index'));

  const violations: Array<StructureViolation> = [];
  if (
    declaration(sheetRule?.body ?? '', 'position') !== 'relative' ||
    declaration(footerRule?.body ?? '', 'position') !== 'sticky' ||
    declaration(footerRule?.body ?? '', 'bottom') !== '0' ||
    declaration(nowWrapRule?.body ?? '', 'height') !== '0' ||
    !(footerZ < sheetZ && sheetZ < nowZ)
  ) {
    violations.push({
      file: chromeFile,
      line: lineAt(chrome, footerRule?.index ?? 0),
      message:
        'Keep `.chrome__footer` (`position: sticky; bottom: 0`), `.collageSheet` (`position: relative`), and `.chrome__nowWrap` (`height: 0`) ordered as footer < sheet < nowWrap in z-index',
      rule: 'css-footer-curtain',
    });
  }
  if (!declaration(gridRule?.body ?? '', 'padding-block')) {
    violations.push({
      file: chromeFile,
      line: lineAt(chrome, gridRule?.index ?? 0),
      message:
        'Set symmetric vertical spacing on `.chrome__footerGrid` with `padding-block` so top and bottom footer padding stay equal',
      rule: 'css-footer-curtain',
    });
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

const HOVER_MENU_OWNERS = new Set([
  'apps/web/src/app/collage/PillMenu.tsx',
  'apps/web/src/app/collage/hoverMenu.ts',
]);
const SKELETON_OWNERS = new Set(['packages/ui/core/Skeleton.tsx', 'packages/ui/theme/index.ts']);
const UNIT_CONSTANT_OWNERS = new Set([
  'apps/web/src/app/activities/stravaFormat.ts',
  'packages/shared-core/formatting/formattedDistance.ts',
]);

export function checkNoDuplicateImplementations(
  relPath: string,
  content: string,
  lines?: ReadonlyArray<string>,
): Array<StructureViolation> {
  if (isTestFile(relPath) || relPath.startsWith('packages/cli/')) {
    return [];
  }
  const checkHoverMenu = !HOVER_MENU_OWNERS.has(relPath) && content.includes('bindHoverMenu');
  const checkSkeleton =
    !SKELETON_OWNERS.has(relPath) &&
    (content.includes('SkeletonLine') || content.includes('data-skeleton'));
  const checkCronAuth =
    relPath.startsWith('apps/web/src/app/api/') &&
    relPath !== 'apps/web/src/app/api/apiResponses.ts' &&
    content.includes('CRON_SECRET');
  const checkTimingSafe =
    relPath !== 'packages/services/auth/devConsoleBasicAuth.ts' &&
    content.includes('timingSafeEqual');
  const checkUnitConstants =
    !UNIT_CONSTANT_OWNERS.has(relPath) &&
    (content.includes('METERS_PER_MILE') || content.includes('FEET_PER_METER'));
  const checkCountFormatter =
    relPath !== 'packages/shared-core/formatting/formattedDistance.ts' &&
    content.includes('Intl.NumberFormat');

  if (
    !checkHoverMenu &&
    !checkSkeleton &&
    !checkCronAuth &&
    !checkTimingSafe &&
    !checkUnitConstants &&
    !checkCountFormatter
  ) {
    return [];
  }

  const sourceLines = lines ?? content.split('\n');
  const violations: Array<StructureViolation> = [];
  for (let i = 0; i < sourceLines.length; i += 1) {
    const lineText = sourceLines[i] ?? '';
    const line = i + 1;
    if (checkHoverMenu && /\bbindHoverMenu\b/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Use HoverMenu or PillMenu from apps/web/src/app/collage/PillMenu.tsx instead of wiring bindHoverMenu directly',
        rule: 'no-duplicate-hover-menu',
      });
    }
    if (checkSkeleton && /\bfunction\s+SkeletonLine\b|\bdata-skeleton\b/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Use Skeleton from @dg/ui/core/Skeleton instead of defining a custom SkeletonLine or raw data-skeleton element',
        rule: 'no-duplicate-skeleton',
      });
    }
    if (checkCronAuth && /\bprocess\.env\.CRON_SECRET\b/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Use isCronAuthorized from apps/web/src/app/api/apiResponses.ts instead of duplicating CRON_SECRET Bearer checks',
        rule: 'no-duplicate-cron-auth',
      });
    }
    if (checkTimingSafe && /\btimingSafeEqual\s*\(/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Use timingSafeEqualStrings from @dg/services/auth/devConsoleBasicAuth instead of calling crypto.timingSafeEqual directly',
        rule: 'no-duplicate-timing-safe-equal',
      });
    }
    if (checkUnitConstants && /\b(?:METERS_PER_MILE|FEET_PER_METER)\s*=/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Import METERS_PER_MILE from @dg/shared-core/formatting/formattedDistance and formatFeet/formatMiles from stravaFormat.ts instead of redeclaring conversion constants',
        rule: 'no-duplicate-unit-constants',
      });
    }
    if (checkCountFormatter && /new\s+Intl\.NumberFormat\(\s*['"]en-US['"]\s*\)/.test(lineText)) {
      violations.push({
        file: relPath,
        line,
        message:
          'Use formatCount from @dg/shared-core/formatting/formattedDistance instead of instantiating a duplicate bare Intl.NumberFormat("en-US")',
        rule: 'no-duplicate-count-formatter',
      });
    }
  }
  return violations;
}
