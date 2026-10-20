import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkCssClassesAndVariables,
  checkOrphanCssFiles,
  extractDefinedCssClasses,
  extractReferencedCssClasses,
} from './check-css.js';

export const MAX_SOURCE_FILE_LINES = 350;
export const MAX_TEST_FILE_LINES = 500;

const LEGACY_LINE_COUNT_ALLOWLIST: Record<string, number> = {
  'packages/ui/theme/css.tsx': 455,
};

const SERVER_ONLY_EXEMPT_FILES: ReadonlySet<string> = new Set([
  'packages/services/auth/devConsoleBasicAuth.ts',
  'packages/services/strava/webhooks/parseStravaError.ts',
]);

const LEGACY_SECTION_DIVIDER_ALLOWLIST: ReadonlySet<string> = new Set([
  'apps/web/src/app/spotify/TrackListing.tsx',
  'packages/content-models/scripts/graphql-schema.ts',
]);

const LEGACY_TYPEOF_IMPORT_ALLOWLIST: ReadonlySet<string> = new Set([
  'packages/services/spotify/__tests__/fetchAlbumDetail.test.ts',
  'packages/services/spotify/__tests__/fetchMusicHistoryPage.test.ts',
]);

const BANNED_GENERIC_COMPONENT_FILENAMES: ReadonlySet<string> = new Set([
  'common.tsx',
  'helpers.tsx',
  'shared.tsx',
  'utils.tsx',
]);

const INLINE_TYPEOF_IMPORT_TOKEN = `${'typeof'} ${'import('}`;

export type StructureViolation = {
  file: string;
  line: number;
  message: string;
  rule: string;
};

function isTestFile(relPath: string): boolean {
  return (
    relPath.includes('__tests__/') ||
    /\.test\.(ts|tsx)$/.test(relPath) ||
    relPath.endsWith('jest.config.ts')
  );
}

function isPureTypeModule(content: string): boolean {
  const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return !/\bexport\s+(?:async\s+)?(?:function|const|let|var|class|default)\b/.test(
    withoutComments,
  );
}

export function checkFileStructure(relPath: string, content: string): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  if (!/\.(ts|tsx)$/.test(relPath)) {
    return violations;
  }

  const lines = content.split('\n');
  const lineCount = lines.length;
  const baseName = path.posix.basename(relPath);
  const isTest = isTestFile(relPath);

  if (BANNED_GENERIC_COMPONENT_FILENAMES.has(baseName)) {
    violations.push({
      file: relPath,
      line: 1,
      message: `Rename generic component file "${baseName}" after its primary export`,
      rule: 'component-file-naming',
    });
  }

  const maxLines =
    LEGACY_LINE_COUNT_ALLOWLIST[relPath] ?? (isTest ? MAX_TEST_FILE_LINES : MAX_SOURCE_FILE_LINES);
  if (lineCount > maxLines) {
    violations.push({
      file: relPath,
      line: lineCount,
      message: `File has ${lineCount} lines (maximum allowed is ${maxLines})`,
      rule: 'max-file-lines',
    });
  }

  if (
    relPath.startsWith('packages/services/') &&
    relPath.endsWith('.ts') &&
    !isTest &&
    !SERVER_ONLY_EXEMPT_FILES.has(relPath) &&
    !isPureTypeModule(content)
  ) {
    const hasServerOnly =
      content.includes("import 'server-only'") || content.includes('import "server-only"');
    if (!hasServerOnly) {
      violations.push({
        file: relPath,
        line: 1,
        message: "Services runtime modules must include `import 'server-only';` at the top",
        rule: 'server-only-services',
      });
    }
  }

  const canImportDb =
    relPath.startsWith('packages/services/') || relPath.startsWith('packages/db/') || isTest;

  for (let i = 0; i < lines.length; i += 1) {
    const lineText = lines[i] ?? '';
    const lineNum = i + 1;

    if (
      !canImportDb &&
      /\bfrom\s+['"]@dg\/db(?:['"]|\/)/.test(lineText) &&
      !lineText.includes('@dg/db/testing')
    ) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Only packages/services may import @dg/db in runtime code',
        rule: 'db-imports',
      });
    }

    if (
      !LEGACY_SECTION_DIVIDER_ALLOWLIST.has(relPath) &&
      /^\s*\/\/\s*(?:[-=]{3,}|\u2500{3,})/.test(lineText)
    ) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Avoid section header divider comments',
        rule: 'no-section-dividers',
      });
    }

    if (
      !LEGACY_TYPEOF_IMPORT_ALLOWLIST.has(relPath) &&
      lineText.includes(INLINE_TYPEOF_IMPORT_TOKEN)
    ) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Use direct top-level imports instead of inline typeof import',
        rule: 'no-inline-typeof-import',
      });
    }
  }

  return violations;
}

export function checkRouteCssImports(
  cssFiles: ReadonlyMap<string, string>,
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const definedClasses = extractDefinedCssClasses(cssFiles);
  const usagesByFile = new Map<string, Array<{ cls: string; file: string; line: number }>>();
  for (const usage of extractReferencedCssClasses(sourceFiles)) {
    const list = usagesByFile.get(usage.file) ?? [];
    list.push(usage);
    usagesByFile.set(usage.file, list);
  }

  const resolveImport = (fromFile: string, spec: string): string | null => {
    const base = spec.startsWith('.')
      ? path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec))
      : spec.startsWith('@dg/')
        ? path.posix.normalize(`packages/${spec.slice('@dg/'.length)}`)
        : null;
    if (!base) {
      return null;
    }
    if (base.endsWith('.css')) {
      return cssFiles.has(base) ? base : null;
    }
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      if (sourceFiles.has(`${base}${ext}`)) {
        return `${base}${ext}`;
      }
    }
    return null;
  };

  const rootLayout = 'apps/web/src/app/layout.tsx';
  const rootCss = new Set<string>();
  for (const m of (sourceFiles.get(rootLayout) ?? '').matchAll(
    /(?:\bfrom\s+|\bimport\s+)['"]([^'"]+\.css)['"]/g,
  )) {
    const resolved = m[1] ? resolveImport(rootLayout, m[1]) : null;
    if (resolved) {
      rootCss.add(resolved);
    }
  }

  const violations: Array<StructureViolation> = [];
  for (const entry of sourceFiles.keys()) {
    if (
      !/^apps\/web\/src\/app\/(?:.*\/)?(?:page|not-found|error)\.tsx$/.test(entry) ||
      entry.includes('[...rest]')
    ) {
      continue;
    }
    const queue: Array<string> = [entry];
    for (
      let dir = path.posix.dirname(entry);
      dir.startsWith('apps/web/src/app/');
      dir = path.posix.dirname(dir)
    ) {
      if (sourceFiles.has(`${dir}/layout.tsx`)) {
        queue.push(`${dir}/layout.tsx`);
      }
    }

    const visitedSources = new Set<string>();
    const routeCss = new Set<string>(rootCss);
    while (queue.length > 0) {
      const current = queue.pop();
      if (!current || visitedSources.has(current)) {
        continue;
      }
      visitedSources.add(current);
      for (const m of (sourceFiles.get(current) ?? '').matchAll(
        /(?:\bfrom\s+|\bimport\s+)['"]([^'"]+)['"]/g,
      )) {
        const resolved = m[1] ? resolveImport(current, m[1]) : null;
        if (resolved?.endsWith('.css')) {
          routeCss.add(resolved);
        } else if (resolved && !visitedSources.has(resolved)) {
          queue.push(resolved);
        }
      }
    }

    const cssQueue = [...routeCss];
    while (cssQueue.length > 0) {
      const currentCss = cssQueue.pop();
      for (const m of (currentCss ? (cssFiles.get(currentCss) ?? '') : '').matchAll(
        /^\s*@import\s+['"]([^'"]+\.css)['"]/gm,
      )) {
        const resolved = currentCss && m[1] ? resolveImport(currentCss, m[1]) : null;
        if (resolved && !routeCss.has(resolved)) {
          routeCss.add(resolved);
          cssQueue.push(resolved);
        }
      }
    }

    const reportedCss = new Set<string>();
    for (const srcFile of visitedSources) {
      for (const usage of usagesByFile.get(srcFile) ?? []) {
        const def = definedClasses.get(usage.cls);
        if (def && ![...def.files].some((f) => routeCss.has(f)) && !reportedCss.has(def.file)) {
          reportedCss.add(def.file);
          violations.push({
            file: entry,
            line: 1,
            message: `Route uses ".${usage.cls}" (via ${srcFile}) without importing "${def.file}"`,
            rule: 'route-missing-css',
          });
        }
      }
    }
  }
  return violations;
}

export function checkWorkspaceStructure(repoRoot: string): Array<StructureViolation> {
  const gitOpts = { cwd: repoRoot, encoding: 'utf8' as const };
  const tracked = execFileSync('git', ['ls-files', 'apps', 'packages'], gitOpts);
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', 'apps', 'packages'],
    gitOpts,
  );
  const allTrackedPaths = [
    ...new Set(
      [...tracked.split('\n'), ...untracked.split('\n')]
        .map((line) => line.trim())
        .filter(
          (relPath) =>
            Boolean(relPath) &&
            !relPath.includes('/migrations/') &&
            !relPath.includes('/dist/') &&
            !relPath.includes('/.next/'),
        ),
    ),
  ].sort();

  const relPaths = allTrackedPaths.filter((relPath) => /\.(ts|tsx)$/.test(relPath));
  const cssPaths = allTrackedPaths.filter(
    (relPath) =>
      (relPath.startsWith('apps/web/src/') || relPath.startsWith('packages/')) &&
      relPath.endsWith('.css'),
  );
  const sourceFiles = new Map<string, string>();
  const cssFiles = new Map<string, string>();
  const cssImporters = new Map<string, string>();
  const violations: Array<StructureViolation> = [];

  for (const relPath of relPaths) {
    const fullPath = path.join(repoRoot, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      violations.push(...checkFileStructure(relPath, content));
      sourceFiles.set(relPath, content);
      cssImporters.set(relPath, content);
    }
  }
  for (const cssPath of cssPaths) {
    const fullPath = path.join(repoRoot, cssPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      cssFiles.set(cssPath, content);
      cssImporters.set(cssPath, content);
    }
  }
  violations.push(...checkOrphanCssFiles(cssPaths, cssImporters));
  violations.push(...checkCssClassesAndVariables(cssFiles, sourceFiles));
  violations.push(...checkRouteCssImports(cssFiles, sourceFiles));
  return violations;
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '../../..');
  const violations = checkWorkspaceStructure(repoRoot);
  if (violations.length > 0) {
    for (const v of violations) {
      process.stderr.write(`${v.file}:${v.line}: [${v.rule}] ${v.message}\n`);
    }
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
