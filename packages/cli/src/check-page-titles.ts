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

  const baseRule = (css: string, sel: string) =>
    cssRules(css).find((r) => !r.media && r.selectors.includes(sel));
  const sheetRule = baseRule(collage, '.collageSheet');
  const rootRule = baseRule(collage, '.collageRoot');
  const bleedRule = baseRule(collage, '.collageBleed');
  const footerRule = baseRule(chrome, '.chrome__footer');
  const nowWrapRule = baseRule(chrome, '.chrome__nowWrap');
  const gridRule = baseRule(chrome, '.chrome__footerGrid');

  const sheetZ = Number(declaration(sheetRule?.body ?? '', 'z-index'));
  const footerZ = Number(declaration(footerRule?.body ?? '', 'z-index'));
  const nowZ = Number(declaration(nowWrapRule?.body ?? '', 'z-index'));

  const violations: Array<StructureViolation> = [];
  const flag = (isChrome: boolean, idx: number | undefined, rule: string, message: string) =>
    violations.push({
      file: isChrome ? chromeFile : collageFile,
      line: lineAt(isChrome ? chrome : collage, idx ?? 0),
      message,
      rule,
    });

  if (
    declaration(sheetRule?.body ?? '', 'position') !== 'relative' ||
    declaration(footerRule?.body ?? '', 'position') !== 'sticky' ||
    declaration(footerRule?.body ?? '', 'bottom') !== '0' ||
    declaration(nowWrapRule?.body ?? '', 'height') !== '0' ||
    !(footerZ < sheetZ && sheetZ < nowZ)
  ) {
    flag(true, footerRule?.index, 'css-footer-curtain', 'Keep footer < sheet < nowWrap in z-index');
  }
  if (!declaration(gridRule?.body ?? '', 'padding-block')) {
    flag(
      true,
      gridRule?.index,
      'css-footer-curtain',
      'Set `padding-block` on `.chrome__footerGrid`',
    );
  }
  if (rootRule && declaration(rootRule.body, 'background-image')?.includes('grain')) {
    flag(false, rootRule.index, 'css-footer-stationary-texture', 'No grain on `.collageRoot`');
  }
  if (
    footerRule &&
    declaration(footerRule.body, 'background-image') !== undefined &&
    (!declaration(footerRule.body, 'background-color') ||
      !declaration(footerRule.body, 'background-image')?.includes('grain'))
  ) {
    flag(true, footerRule.index, 'css-footer-stationary-texture', 'Set grain on `.chrome__footer`');
  }
  if (bleedRule && declaration(bleedRule.body, '--sheet-inset') !== '0px') {
    flag(
      false,
      bleedRule.index,
      'css-footer-curtain',
      'Set `--sheet-inset: 0px` on `.collageBleed`',
    );
  }
  for (const r of cssRules(chrome).filter((rule) => Boolean(rule.media))) {
    if (
      r.selectors.includes('.chrome__nowPlaying') &&
      declaration(r.body, 'order')?.startsWith('-')
    ) {
      flag(
        true,
        r.index,
        'css-mobile-header-order',
        'No negative `order` on `.chrome__nowPlaying`',
      );
    }
    if (
      r.selectors.includes('.chrome__colophonNav') &&
      declaration(r.body, 'grid-template-columns')?.includes('repeat(3')
    ) {
      flag(
        true,
        r.index,
        'css-footer-colophon-pills',
        'Size `.chrome__colophonNav` pills to content instead of `repeat(3, ...)`',
      );
    }
  }
  return violations;
}

/** Keeps the header row vertically centered, the `dg.` sticker flush with the left rail, and its desktop SVG height balanced with Now Playing. */
export function checkHeaderLogoAlignment(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const chromeFile = 'apps/web/src/app/collage/chrome.css';
  const chrome = cssFiles.get(chromeFile);
  if (!chrome) return [];

  const baseRules = cssRules(chrome).filter((r) => !r.media);
  const findRule = (selector: string) => baseRules.find((r) => r.selectors.includes(selector));
  const headerRule = findRule('.chrome__header');
  const logoRule = findRule('.chrome__logo');
  const svgRule = findRule('.chrome__logo > svg');
  const violations: Array<StructureViolation> = [];
  const flag = (rule: CssRule | undefined, message: string) =>
    violations.push({
      file: chromeFile,
      line: lineAt(chrome, rule?.index ?? 0),
      message,
      rule: 'css-header-logo-alignment',
    });

  if (headerRule && declaration(headerRule.body, 'align-items') !== 'center') {
    flag(headerRule, 'Set `align-items: center` on `.chrome__header`');
  }
  if (logoRule && declaration(logoRule.body, 'padding') !== '0') {
    flag(logoRule, 'Set `padding: 0` on `.chrome__logo`');
  }
  const svgHeights = [
    ...(declaration(svgRule?.body ?? '', 'height') ?? '').matchAll(/(\d+(?:\.\d+)?)px/g),
  ].map((m) => Number(m[1]));
  if (svgRule && (svgHeights.length === 0 || Math.max(...svgHeights) < 64)) {
    flag(svgRule, 'Keep `.chrome__logo > svg` desktop height at least 64px');
  }
  for (const selector of ['.chrome__nowPlaying', '.chrome__nav']) {
    const rule = findRule(selector);
    const mt = declaration(rule?.body ?? '', 'margin-top');
    if (rule && mt && mt !== '0' && mt !== '0px') {
      flag(rule, `Avoid \`margin-top\` on \`${selector}\``);
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
    if (!file.endsWith('.tsx') || isTestFile(file)) continue;
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
const NEXT_IMAGE_OWNERS = new Set([
  'apps/web/src/utils/imageLoader.ts',
  'packages/ui/dependent/Image.tsx',
]);
const SKELETON_OWNERS = new Set(['packages/ui/core/Skeleton.tsx', 'packages/ui/theme/index.ts']);
const UNIT_CONSTANT_OWNERS = new Set([
  'apps/web/src/app/activities/stravaFormat.ts',
  'packages/shared-core/formatting/formattedDistance.ts',
]);
const SOCIAL_CARD_VARIANT_ADAPTERS = new Set([
  'apps/web/src/app/collage/socialCardVariants.ts',
  'apps/web/src/app/collage/stravaSocialCardVariant.ts',
]);
const READING_SERVER_COMPONENTS = new Set([
  'apps/web/src/app/reading/ReadingShelf.tsx',
  'apps/web/src/app/reading/ReadingCards.tsx',
  'apps/web/src/app/reading/ReadingHero.tsx',
]);
const ROUTE_CLASS_OR_IMPORT_IN_SHARED =
  /\b(?:stats|strava|streets|reading|changelog|music|home|siteMap|devConsole|error)__[a-zA-Z0-9_-]+|from\s+['"]\.\.\/(?:music|activities|reading|changelog|site-map|dev-console|home)\//;

export function checkNoDuplicateImplementations(
  relPath: string,
  content: string,
  lines?: ReadonlyArray<string>,
): Array<StructureViolation> {
  if (isTestFile(relPath) || relPath.startsWith('packages/cli/')) return [];
  const rules: ReadonlyArray<readonly [boolean, RegExp, string, string]> = [
    [
      READING_SERVER_COMPONENTS.has(relPath) && content.includes('use client'),
      /^['"]use client['"]/,
      'reading-shelf-server-component',
      'Keep ReadingShelf, ReadingCards, and ReadingHero as Server Components and isolate filter state in ReadingFilterController.tsx',
    ],
    [
      !HOVER_MENU_OWNERS.has(relPath) && content.includes('bindHoverMenu'),
      /\bbindHoverMenu\b/,
      'no-duplicate-hover-menu',
      'Use HoverMenu or PillMenu from apps/web/src/app/collage/PillMenu.tsx instead of wiring bindHoverMenu directly',
    ],
    [
      !NEXT_IMAGE_OWNERS.has(relPath) && content.includes('next/image'),
      /\bfrom\s+['"]next\/image['"]/,
      'no-raw-next-image',
      'Use Image from @dg/ui/dependent/Image instead of importing next/image directly',
    ],
    [
      relPath === 'apps/web/next.config.ts' &&
        (!content.includes("loader: 'custom'") ||
          !content.includes("loaderFile: './src/utils/imageLoader.ts'")),
      /\bimages\s*:/,
      'custom-image-loader',
      'Configure images.loader = "custom" and images.loaderFile = "./src/utils/imageLoader.ts" in next.config.ts so next/image bypasses /_next/image',
    ],
    [
      !SKELETON_OWNERS.has(relPath) &&
        (content.includes('SkeletonLine') || content.includes('data-skeleton')),
      /\bfunction\s+SkeletonLine\b|\bdata-skeleton\b/,
      'no-duplicate-skeleton',
      'Use Skeleton from @dg/ui/core/Skeleton instead of defining a custom SkeletonLine or raw data-skeleton element',
    ],
    [
      relPath.startsWith('apps/web/src/app/api/') &&
        relPath !== 'apps/web/src/app/api/apiResponses.ts' &&
        content.includes('CRON_SECRET'),
      /\bprocess\.env\.CRON_SECRET\b/,
      'no-duplicate-cron-auth',
      'Use isCronAuthorized from apps/web/src/app/api/apiResponses.ts instead of duplicating CRON_SECRET Bearer checks',
    ],
    [
      relPath !== 'packages/services/auth/devConsoleBasicAuth.ts' &&
        content.includes('timingSafeEqual'),
      /\btimingSafeEqual\s*\(/,
      'no-duplicate-timing-safe-equal',
      'Use timingSafeEqualStrings from @dg/services/auth/devConsoleBasicAuth instead of calling crypto.timingSafeEqual directly',
    ],
    [
      !UNIT_CONSTANT_OWNERS.has(relPath) &&
        (content.includes('METERS_PER_MILE') || content.includes('FEET_PER_METER')),
      /\b(?:METERS_PER_MILE|FEET_PER_METER)\s*=/,
      'no-duplicate-unit-constants',
      'Import METERS_PER_MILE from @dg/shared-core/formatting/formattedDistance and formatFeet/formatMiles from stravaFormat.ts instead of redeclaring conversion constants',
    ],
    [
      relPath !== 'packages/shared-core/formatting/formattedDistance.ts' &&
        content.includes('Intl.NumberFormat'),
      /new\s+Intl\.NumberFormat\(\s*['"]en-US['"]\s*\)/,
      'no-duplicate-count-formatter',
      'Use formatCount from @dg/shared-core/formatting/formattedDistance instead of instantiating a duplicate bare Intl.NumberFormat("en-US")',
    ],
    [
      relPath.startsWith('apps/web/src/') &&
        relPath !== 'apps/web/src/app/collage/FilterBar.tsx' &&
        content.includes('pillStrip'),
      /\bpillStrip\b/,
      'no-duplicate-filter-bar',
      'Use FilterBar from apps/web/src/app/collage/FilterBar.tsx instead of applying .pillStrip directly',
    ],
    [
      (relPath.startsWith('packages/ui/') ||
        relPath.startsWith('packages/maps/') ||
        (relPath.startsWith('apps/web/src/app/collage/') &&
          !SOCIAL_CARD_VARIANT_ADAPTERS.has(relPath))) &&
        ROUTE_CLASS_OR_IMPORT_IN_SHARED.test(content),
      ROUTE_CLASS_OR_IMPORT_IN_SHARED,
      'no-consumer-leakage-in-shared-component',
      'Shared components in collage/, packages/ui/, and packages/maps/ must not import from route directories or reference route-specific classes',
    ],
  ];
  const active = rules.filter(([enabled]) => enabled);
  if (active.length === 0) return [];
  const sourceLines = lines ?? content.split('\n');
  return sourceLines.flatMap((lineText, i) =>
    active
      .filter(([, pattern]) => pattern.test(lineText))
      .map(([, , rule, message]) => ({ file: relPath, line: i + 1, message, rule })),
  );
}
