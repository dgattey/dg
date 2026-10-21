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
const BIOME_SUPPRESSION_TOKEN = `${'biome'}-${'ignore'}`;
const BIOME_CHECKED_FILE = /\.(?:c?js|mjs|tsx?|css|jsonc?)$/;

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

/** Lint findings get fixed, never suppressed: no suppression comment in any file Biome checks. */
function checkNoBiomeSuppressions(
  relPath: string,
  lines: Array<string>,
): Array<StructureViolation> {
  return lines.flatMap((lineText, i) =>
    lineText.includes(BIOME_SUPPRESSION_TOKEN)
      ? [
          {
            file: relPath,
            line: i + 1,
            message: 'Fix the lint instead of suppressing it',
            rule: 'no-biome-suppressions',
          },
        ]
      : [],
  );
}

export function checkFileStructure(relPath: string, content: string): Array<StructureViolation> {
  const lines = content.split('\n');
  const violations = checkNoBiomeSuppressions(relPath, lines);
  if (!/^(?:apps|packages)\/.*\.(ts|tsx)$/.test(relPath)) {
    return violations;
  }

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

export function checkWorkspaceStructure(repoRoot: string): Array<StructureViolation> {
  const trackedOutput = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' });
  const untrackedOutput = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  const relPaths = [
    ...new Set(
      [...trackedOutput.split('\n'), ...untrackedOutput.split('\n')]
        .map((line) => line.trim())
        .filter(
          (relPath) =>
            BIOME_CHECKED_FILE.test(relPath) &&
            !relPath.includes('/migrations/') &&
            !relPath.includes('/dist/') &&
            !relPath.includes('/.next/'),
        ),
    ),
  ].sort();

  const violations: Array<StructureViolation> = [];
  for (const relPath of relPaths) {
    const fullPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    violations.push(...checkFileStructure(relPath, content));
  }
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
