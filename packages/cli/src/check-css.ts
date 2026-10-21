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
