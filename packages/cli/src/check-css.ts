import path from 'node:path';
import {
  cssRules,
  declaration,
  isTestFile,
  lineAt,
  stripCssComments,
} from './check-page-titles.js';
import type { StructureViolation } from './check-structure.js';

export const TYPOGRAPHY_CSS_FILE = 'apps/web/src/app/collage/typography.css';

const ALLOWED_TYPOGRAPHY_CSS_SELECTOR =
  /^(?::root|body|button|input|select|textarea|b|strong|small|code|kbd|pre|samp|h[1-6]|\[data-typography(?:-(?:lg|md|sm|xs))?(?:="[^"]+")?\])$/;
const CSS_IMPORT_PATTERN =
  /(?:^\s*import\s+['"]([^'"]+\.css)['"]|^\s*@import\s+['"]([^'"]+\.css)['"])/gm;

function extractImportedCssPaths(importerPath: string, content: string): Array<string> {
  const dir = path.posix.dirname(importerPath);
  const resolved: Array<string> = [];
  for (const match of content.matchAll(CSS_IMPORT_PATTERN)) {
    const specifier = match[1] ?? match[2];
    if (specifier?.startsWith('.')) {
      resolved.push(path.posix.normalize(path.posix.join(dir, specifier)));
    }
  }
  return resolved;
}

export function checkOrphanCssFiles(
  cssPaths: ReadonlyArray<string>,
  importers: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const importedCss = new Set<string>();
  for (const [relPath, content] of importers) {
    for (const resolved of extractImportedCssPaths(relPath, content)) {
      importedCss.add(resolved);
    }
  }
  return cssPaths
    .filter((cssPath) => !importedCss.has(cssPath))
    .map((file) => ({
      file,
      line: 1,
      message: 'Stylesheet is not imported by any source or CSS file',
      rule: 'no-orphan-css',
    }));
}

const FONT_SIZE_DECLARATION = /(?<![-\w])(?:font-size|font)\s*:([^;{}]+)/g;
const LITERAL_FONT_SIZE = /\d(?:px|rem)\b/;
const TYPE_TOKEN_DECLARATION = /(--type-[a-z0-9-]+)\s*:/g;
const TYPE_TOKEN_USE = /var\(\s*(--type-[a-z0-9-]+)/g;
const FONT_FACE_BLOCK = /@font-face\s*\{[^}]*\}/g;
const FONT_FAMILY_DECLARATION = /(?<![-\w])font-family\s*:([^;{}]+)/g;
const FONT_SHORTHAND_DECLARATION = /(?<![-\w])font\s*:([^;{}]+)/g;
const FONT_WEIGHT_DECLARATION = /(?<![-\w])font-weight\s*:([^;{}]+)/g;
const TYPOGRAPHY_PROPERTY_DECLARATION =
  /(?<![-\w])(font|font-family|font-size|font-weight|font-style|font-variant-numeric|line-height|letter-spacing)\s*:([^;{}]+)/g;
const CANONICAL_FAMILY = /^(?:var\(--(?:display|body|font-mono)\)|inherit)$/;
const CANONICAL_WEIGHT = /^(?:400|600|700|inherit)$/;
const CLASS_SELECTOR_TOKEN = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;
const KEYFRAMES_DECLARATION = /@keyframes\s+([a-zA-Z0-9_-]+)/g;
const IDENTIFIER_TOKEN = /[a-zA-Z_][a-zA-Z0-9_-]*/g;
const TEMPLATE_CLASS_PREFIX = /([a-zA-Z_][a-zA-Z0-9_-]*)\$\{/g;
const STATIC_JSX_CLASS_ATTR = /\b(?:className|innerClassName)\s*=\s*"([^"]+)"/g;

function maskCssCommentsAndDeclarations(content: string): string {
  return stripCssComments(content)
    .replace(/"[^"\n]*"|'[^'\n]*'/g, (match) => ' '.repeat(match.length))
    .replace(/(?<=[{;\s])[a-zA-Z-]+\s*:[^;{}]+/g, (match) => match.replace(/[^\n]/g, ' '));
}

export function checkUnusedCssRules(
  cssFiles: ReadonlyMap<string, string>,
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const corpusParts: Array<string> = [];
  const dynamicPrefixes: Array<string> = [];

  for (const [file, content] of sourceFiles) {
    if (isTestFile(file) || file.endsWith('cutOutShapes.ts')) continue;
    corpusParts.push(content);
    if (content.includes('${')) {
      for (const match of content.matchAll(TEMPLATE_CLASS_PREFIX)) {
        if (match[1]) dynamicPrefixes.push(match[1]);
      }
    }
  }

  const usedTokens = new Set<string>(corpusParts.join('\n').match(IDENTIFIER_TOKEN) ?? []);
  const allCssWithoutComments = [...cssFiles.values()]
    .map((c) => c.replace(/\/\*[\s\S]*?\*\//g, ''))
    .join('\n');
  const declaredClasses = new Set<string>();
  const violations: Array<StructureViolation> = [];

  for (const [file, content] of cssFiles) {
    const selectorOnlyCss = maskCssCommentsAndDeclarations(content);
    const seenInFile = new Set<string>();

    for (const match of selectorOnlyCss.matchAll(CLASS_SELECTOR_TOKEN)) {
      const className = match[1] ?? '';
      if (!className) continue;
      declaredClasses.add(className);
      if (seenInFile.has(className)) continue;
      seenInFile.add(className);

      const isUsed =
        usedTokens.has(className) || dynamicPrefixes.some((prefix) => className.startsWith(prefix));
      if (!isUsed) {
        violations.push({
          file,
          line: lineAt(content, match.index),
          message: `.${className} is not referenced in any source file`,
          rule: 'no-unused-css-class',
        });
      }
    }

    for (const match of selectorOnlyCss.matchAll(KEYFRAMES_DECLARATION)) {
      const name = match[1] ?? '';
      if (!name) continue;
      const cssMatches = allCssWithoutComments.match(new RegExp(`\\b${name}\\b`, 'g')) ?? [];
      if (cssMatches.length <= 1 && !usedTokens.has(name)) {
        violations.push({
          file,
          line: lineAt(content, match.index),
          message: `@keyframes ${name} is never referenced`,
          rule: 'no-unused-css-keyframes',
        });
      }
    }
  }

  for (const [file, content] of sourceFiles) {
    if (!file.endsWith('.tsx') || isTestFile(file)) continue;
    for (const match of content.matchAll(STATIC_JSX_CLASS_ATTR)) {
      for (const token of (match[1] ?? '').split(/\s+/).filter(Boolean)) {
        if (!declaredClasses.has(token)) {
          violations.push({
            file,
            line: lineAt(content, match.index),
            message: `Class "${token}" is not declared in any stylesheet`,
            rule: 'no-undefined-css-class',
          });
        }
      }
    }
  }

  return violations;
}

function checkFontSystem(file: string, raw: string): Array<StructureViolation> {
  const content = stripCssComments(raw).replace(FONT_FACE_BLOCK, (block) =>
    block.replace(/[^\n]/g, ' '),
  );
  const violations: Array<StructureViolation> = [];
  const flag = (index: number, message: string, rule: string) =>
    violations.push({ file, line: lineAt(content, index), message, rule });

  for (const match of content.matchAll(FONT_FAMILY_DECLARATION)) {
    if (!CANONICAL_FAMILY.test((match[1] ?? '').trim())) {
      flag(match.index, 'Set font-family to var(--display) or var(--body)', 'css-font-family');
    }
  }
  for (const match of content.matchAll(FONT_SHORTHAND_DECLARATION)) {
    const value = (match[1] ?? '').trim();
    if (value === 'inherit') continue;
    if (!/var\(--(?:display|body)\)$/.test(value)) {
      flag(
        match.index,
        'End the font shorthand with var(--display) or var(--body)',
        'css-font-family',
      );
    }
    const weight = value.match(/^(?:italic\s+)?(\d{3})\b/)?.[1];
    if (weight && !CANONICAL_WEIGHT.test(weight)) {
      flag(match.index, `Font weight ${weight} is off the 400/600/700 palette`, 'css-font-weight');
    }
  }
  for (const match of content.matchAll(FONT_WEIGHT_DECLARATION)) {
    const weight = (match[1] ?? '').trim();
    if (!CANONICAL_WEIGHT.test(weight)) {
      flag(match.index, `Font weight ${weight} is off the 400/600/700 palette`, 'css-font-weight');
    }
  }
  if (file === TYPOGRAPHY_CSS_FILE) {
    for (const rule of cssRules(content)) {
      for (const selector of rule.selectors) {
        if (!ALLOWED_TYPOGRAPHY_CSS_SELECTOR.test(selector)) {
          flag(
            rule.index,
            `Use <Typography variant="..."> or data-typography="..." instead of consumer selector "${selector}" in ${TYPOGRAPHY_CSS_FILE}`,
            'css-typography-no-consumer-selectors',
          );
        }
      }
      if (!rule.selectors.some((s) => s.startsWith('[data-typography='))) continue;
      const family = declaration(rule.body, 'font-family');
      const weight = declaration(rule.body, 'font-weight');
      if (family === 'var(--display)' && weight !== '700') {
        flag(rule.index, 'Display roles must use font-weight: 700', 'css-font-weight');
      }
      if (family === 'var(--body)' && weight !== '400' && weight !== '600') {
        flag(rule.index, 'Body roles must use font-weight: 400 or 600', 'css-font-weight');
      }
    }
  }
  return violations;
}

export function checkTypeScale(cssFiles: ReadonlyMap<string, string>): Array<StructureViolation> {
  const declared = new Set<string>();
  const enforceSingleOwner = cssFiles.has(TYPOGRAPHY_CSS_FILE);
  for (const [file, content] of cssFiles) {
    if (enforceSingleOwner && file !== TYPOGRAPHY_CSS_FILE) continue;
    for (const match of content.matchAll(TYPE_TOKEN_DECLARATION)) {
      declared.add(match[1] ?? '');
    }
  }

  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    const clean = stripCssComments(content).replace(FONT_FACE_BLOCK, (block) =>
      block.replace(/[^\n]/g, ' '),
    );
    if (enforceSingleOwner && file !== TYPOGRAPHY_CSS_FILE) {
      for (const match of clean.matchAll(TYPOGRAPHY_PROPERTY_DECLARATION)) {
        const prop = match[1] ?? 'font';
        violations.push({
          file,
          line: lineAt(clean, match.index),
          message: `Use <Typography variant="..."> or data-typography="..." from ${TYPOGRAPHY_CSS_FILE} instead of declaring \`${prop}\` in ${file}`,
          rule: 'css-typography-single-source',
        });
      }
      continue;
    }

    violations.push(...checkFontSystem(file, content));
    for (const match of clean.matchAll(FONT_SIZE_DECLARATION)) {
      if (LITERAL_FONT_SIZE.test(match[1] ?? '')) {
        violations.push({
          file,
          line: lineAt(clean, match.index),
          message: 'Set font sizes with a --type-* token, not a literal length',
          rule: 'css-type-scale',
        });
      }
    }
    for (const match of clean.matchAll(TYPE_TOKEN_USE)) {
      const token = match[1] ?? '';
      if (!declared.has(token)) {
        violations.push({
          file,
          line: lineAt(clean, match.index),
          message: `${token} is not declared in any stylesheet`,
          rule: 'css-type-scale',
        });
      }
    }
  }
  return violations;
}

export function checkRouteCssImports(
  cssPaths: ReadonlyArray<string>,
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const pageEntries = [...sourceFiles.keys()].filter((file) =>
    /^apps\/web\/src\/app\/(?:.*\/)?page\.tsx$/.test(file),
  );
  const importsByFile = new Map<string, ReadonlySet<string>>();
  for (const [file, content] of sourceFiles) {
    importsByFile.set(file, new Set(extractImportedCssPaths(file, content)));
  }

  const violations: Array<StructureViolation> = [];
  for (const cssPath of cssPaths) {
    if (!cssPath.startsWith('apps/web/src/app/')) continue;
    const cssDir = path.posix.dirname(cssPath);
    const routeDir = cssDir === 'apps/web/src/app/home' ? 'apps/web/src/app' : cssDir;
    for (const pageEntry of pageEntries) {
      if (
        pageEntry !== `${routeDir}/page.tsx` &&
        (routeDir === 'apps/web/src/app' || !pageEntry.startsWith(`${routeDir}/`))
      ) {
        continue;
      }
      if (!(importsByFile.get(pageEntry)?.has(cssPath) ?? false)) {
        violations.push({
          file: pageEntry,
          line: 1,
          message: `Route under "${cssDir}" does not import "${cssPath}" in page.tsx`,
          rule: 'route-missing-css',
        });
      }
    }
  }
  return violations;
}

const SHARED_CSS_PATH = /^(?:packages\/.*|apps\/web\/src\/app\/collage\/[^/]+)\.css$/;
const CONSUMER_CLASS_SELECTOR =
  /\.(?:stats|strava|streets|reading|changelog|music|home|siteMap|devConsole|error)__[a-zA-Z0-9_-]+/g;

export function checkNoConsumerSelectorsInSharedCss(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    if (!SHARED_CSS_PATH.test(file)) continue;
    const selectorOnlyCss = maskCssCommentsAndDeclarations(content);
    for (const match of selectorOnlyCss.matchAll(CONSUMER_CLASS_SELECTOR)) {
      violations.push({
        file,
        line: lineAt(content, match.index),
        message: `Shared stylesheet must not reference route-specific selector "${match[0]}"; expose a shared component or variant prop instead`,
        rule: 'no-consumer-selectors-in-shared-css',
      });
    }
  }
  return violations;
}
