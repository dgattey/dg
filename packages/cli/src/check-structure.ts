import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const CSS_IMPORT_PATTERN =
  /(?:^\s*import\s+['"]([^'"]+\.css)['"]|^\s*@import\s+['"]([^'"]+\.css)['"])/gm;

export function checkOrphanCssFiles(
  cssPaths: ReadonlyArray<string>,
  importers: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const importedCss = new Set<string>();
  for (const [relPath, content] of importers) {
    const dir = path.posix.dirname(relPath);
    for (const match of content.matchAll(CSS_IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2];
      if (!specifier?.startsWith('.')) {
        continue;
      }
      importedCss.add(path.posix.normalize(path.posix.join(dir, specifier)));
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

export function checkWorkspaceStructure(repoRoot: string): Array<StructureViolation> {
  const trackedOutput = execFileSync('git', ['ls-files', 'apps', 'packages'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const untrackedOutput = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', 'apps', 'packages'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    },
  );

  const allTrackedPaths = [
    ...new Set(
      [...trackedOutput.split('\n'), ...untrackedOutput.split('\n')]
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
  const webCssPaths = allTrackedPaths.filter(
    (relPath) => relPath.startsWith('apps/web/src/') && relPath.endsWith('.css'),
  );
  const webImporters = new Map<string, string>();

  const violations: Array<StructureViolation> = [];
  for (const relPath of relPaths) {
    const fullPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    violations.push(...checkFileStructure(relPath, content));
    if (relPath.startsWith('apps/web/src/')) {
      webImporters.set(relPath, content);
    }
  }
  for (const cssPath of webCssPaths) {
    const fullPath = path.join(repoRoot, cssPath);
    if (fs.existsSync(fullPath)) {
      webImporters.set(cssPath, fs.readFileSync(fullPath, 'utf8'));
    }
  }
  violations.push(...checkOrphanCssFiles(webCssPaths, webImporters));
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
