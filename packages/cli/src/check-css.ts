import path from 'node:path';
import type { StructureViolation } from './check-structure.js';

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

  const violations: Array<StructureViolation> = [];
  for (const cssPath of cssPaths) {
    if (!importedCss.has(cssPath)) {
      violations.push({
        file: cssPath,
        line: 1,
        message: 'Stylesheet is not imported by any source or CSS file',
        rule: 'no-orphan-css',
      });
    }
  }
  return violations;
}

const FONT_SIZE_DECLARATION = /(?<![-\w])(?:font-size|font)\s*:([^;{}]+)/g;
const LITERAL_FONT_SIZE = /\d(?:px|rem)\b/;
const TYPE_TOKEN_DECLARATION = /(--type-[a-z0-9-]+)\s*:/g;
const TYPE_TOKEN_USE = /var\(\s*(--type-[a-z0-9-]+)/g;

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

/**
 * Type sizes come from the `--type-*` scale on `.collageRoot`, so a literal size or a
 * token nobody declares fails here instead of rendering at a stray or inherited size.
 */
export function checkTypeScale(cssFiles: ReadonlyMap<string, string>): Array<StructureViolation> {
  const declared = new Set<string>();
  for (const content of cssFiles.values()) {
    for (const match of content.matchAll(TYPE_TOKEN_DECLARATION)) {
      declared.add(match[1] ?? '');
    }
  }

  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    for (const match of content.matchAll(FONT_SIZE_DECLARATION)) {
      if (LITERAL_FONT_SIZE.test(match[1] ?? '')) {
        violations.push({
          file,
          line: lineAt(content, match.index),
          message: 'Set font sizes with a --type-* token, not a literal length',
          rule: 'css-type-scale',
        });
      }
    }
    for (const match of content.matchAll(TYPE_TOKEN_USE)) {
      const token = match[1] ?? '';
      if (!declared.has(token)) {
        violations.push({
          file,
          line: lineAt(content, match.index),
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
  const pageEntries = [...sourceFiles.keys()].filter(
    (file) => /^apps\/web\/src\/app\/(?:.*\/)?page\.tsx$/.test(file) && !file.includes('[...rest]'),
  );
  const importsByFile = new Map<string, ReadonlySet<string>>();
  for (const [file, content] of sourceFiles) {
    importsByFile.set(file, new Set(extractImportedCssPaths(file, content)));
  }

  const violations: Array<StructureViolation> = [];
  for (const cssPath of cssPaths) {
    if (!cssPath.startsWith('apps/web/src/app/')) {
      continue;
    }
    const cssDir = path.posix.dirname(cssPath);
    for (const pageEntry of pageEntries) {
      if (pageEntry !== `${cssDir}/page.tsx` && !pageEntry.startsWith(`${cssDir}/`)) {
        continue;
      }
      let covered = importsByFile.get(pageEntry)?.has(cssPath) ?? false;
      for (
        let dir = path.posix.dirname(pageEntry);
        !covered && dir.startsWith(cssDir);
        dir = path.posix.dirname(dir)
      ) {
        covered = importsByFile.get(`${dir}/layout.tsx`)?.has(cssPath) ?? false;
      }
      if (!covered) {
        violations.push({
          file: pageEntry,
          line: 1,
          message: `Route under "${cssDir}" does not import "${cssPath}" in page.tsx or layout.tsx`,
          rule: 'route-missing-css',
        });
      }
    }
  }
  return violations;
}
