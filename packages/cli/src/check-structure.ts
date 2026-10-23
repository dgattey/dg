import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkOrphanCssFiles,
  checkRouteCssImports,
  checkTypeScale,
  checkUnusedCssRules,
} from './check-css.js';
import { checkGridGapsFit, checkScallopPadding } from './check-css-geometry.js';

export const MAX_SOURCE_FILE_LINES = 350;
const MAX_TEST_FILE_LINES = 500;

const SERVER_ONLY_EXEMPT_FILES: ReadonlySet<string> = new Set([
  'packages/services/auth/devConsoleBasicAuth.ts',
  'packages/services/strava/webhooks/parseStravaError.ts',
]);

const BANNED_GENERIC_COMPONENT_FILENAMES: ReadonlySet<string> = new Set([
  'common.tsx',
  'helpers.tsx',
  'shared.tsx',
  'utils.tsx',
]);

const NON_PUBLIC_PAGE_ROUTES: ReadonlySet<string> = new Set([
  'apps/web/src/app/[...rest]/page.tsx',
  'apps/web/src/app/dev-console/page.tsx',
]);

const SOCIAL_IMAGE_FILENAMES = ['opengraph-image.tsx', 'twitter-image.tsx'] as const;

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

function checkNoBiomeSuppressions(
  relPath: string,
  content: string,
  lines?: Array<string>,
): Array<StructureViolation> {
  if (!content.includes(BIOME_SUPPRESSION_TOKEN)) {
    return [];
  }
  return (lines ?? content.split('\n')).flatMap((lineText, i) =>
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
  if (!/^(?:apps|packages)\/.*\.(ts|tsx)$/.test(relPath)) {
    return checkNoBiomeSuppressions(relPath, content);
  }
  const lines = content.split('\n');
  const violations = checkNoBiomeSuppressions(relPath, content, lines);

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

  const maxLines = isTest ? MAX_TEST_FILE_LINES : MAX_SOURCE_FILE_LINES;
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
    relPath.startsWith('packages/services/') ||
    relPath.startsWith('packages/db/') ||
    (isTest && !relPath.startsWith('apps/'));
  const checkDbImport = !canImportDb && content.includes('@dg/db');
  const checkInlineTypeof = content.includes(INLINE_TYPEOF_IMPORT_TOKEN);
  const checkShortCacheLife =
    relPath.startsWith('apps/web/src/') && !isTest && content.includes('cacheLife(');
  const checkServiceFetchNoStore =
    relPath.startsWith('packages/services/') &&
    !isTest &&
    !content.includes("cache: 'no-store'") &&
    !content.includes('cache: "no-store"') &&
    (content.includes('fetch(') ||
      content.includes('wretch(') ||
      content.includes('GraphQLClient('));
  const checkDividers =
    content.includes('---') || content.includes('===') || content.includes('\u2500\u2500\u2500');

  if (
    !checkDbImport &&
    !checkInlineTypeof &&
    !checkShortCacheLife &&
    !checkServiceFetchNoStore &&
    !checkDividers
  ) {
    return violations;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const lineText = lines[i] ?? '';
    const lineNum = i + 1;

    if (checkDbImport && /\bfrom\s+['"]@dg\/db(?:['"]|\/)/.test(lineText)) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Only packages/services and packages/db may import @dg/db',
        rule: 'db-imports',
      });
    }

    if (checkDividers && /^\s*\/\/\s*(?:[-=]{3,}|\u2500{3,})/.test(lineText)) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Avoid section header divider comments',
        rule: 'no-section-dividers',
      });
    }

    if (checkInlineTypeof && lineText.includes(INLINE_TYPEOF_IMPORT_TOKEN)) {
      violations.push({
        file: relPath,
        line: lineNum,
        message: 'Use direct top-level imports instead of inline typeof import',
        rule: 'no-inline-typeof-import',
      });
    }

    if (checkShortCacheLife && /\bcacheLife\(\s*['"](?:minutes|default)['"]\s*\)/.test(lineText)) {
      violations.push({
        file: relPath,
        line: lineNum,
        message:
          "Use `cacheLife('hours')` or longer for prerendered caches (or `cacheLife('seconds')` behind `connection()`) so routes do not revalidate every 1 to 15 minutes",
        rule: 'no-short-prerender-cache-life',
      });
    }

    if (checkServiceFetchNoStore && /\b(?:fetch|wretch)\(|\bnew\s+GraphQLClient\(/.test(lineText)) {
      violations.push({
        file: relPath,
        line: lineNum,
        message:
          "Upstream HTTP clients in packages/services must set `cache: 'no-store'` so Next.js does not double-write raw responses into the fetch Data Cache",
        rule: 'service-fetch-no-store',
      });
    }
  }

  return violations;
}

export function checkSocialImageRouteParity(
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const pageEntries = [...sourceFiles.keys()]
    .filter(
      (file) =>
        /^apps\/web\/src\/app\/(?:.*\/)?page\.tsx$/.test(file) && !NON_PUBLIC_PAGE_ROUTES.has(file),
    )
    .sort();

  const violations: Array<StructureViolation> = [];
  for (const pageEntry of pageEntries) {
    const routeDir = path.posix.dirname(pageEntry);
    for (const imageFile of SOCIAL_IMAGE_FILENAMES) {
      const expectedPath = `${routeDir}/${imageFile}`;
      if (!sourceFiles.has(expectedPath)) {
        violations.push({
          file: pageEntry,
          line: 1,
          message: `Public page route "${routeDir}" is missing "${expectedPath}"`,
          rule: 'og-image-route-parity',
        });
      }
    }
  }
  return violations;
}

export function checkWorkspaceStructure(repoRoot: string): Array<StructureViolation> {
  const gitOutput = execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const allTrackedPaths = [
    ...new Set(
      gitOutput
        .split('\n')
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

  const relPaths = allTrackedPaths.filter((relPath) => BIOME_CHECKED_FILE.test(relPath));
  const webCssPaths: Array<string> = [];
  const webSources = new Map<string, string>();
  const cssCodeSources = new Map<string, string>();
  const webImporters = new Map<string, string>();
  const webCss = new Map<string, string>();
  const violations: Array<StructureViolation> = [];

  for (const relPath of relPaths) {
    const fullPath = path.join(repoRoot, relPath);
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }
    violations.push(...checkFileStructure(relPath, content));
    if (relPath.startsWith('apps/web/src/')) {
      if (relPath.endsWith('.css')) {
        webCssPaths.push(relPath);
        webImporters.set(relPath, content);
        webCss.set(relPath, content);
      } else if (/\.(ts|tsx)$/.test(relPath)) {
        webSources.set(relPath, content);
        cssCodeSources.set(relPath, content);
        webImporters.set(relPath, content);
      }
    } else if (
      (relPath.startsWith('packages/ui/') || relPath.startsWith('packages/maps/')) &&
      /\.(ts|tsx)$/.test(relPath)
    ) {
      cssCodeSources.set(relPath, content);
    }
  }
  violations.push(...checkOrphanCssFiles(webCssPaths, webImporters));
  violations.push(...checkRouteCssImports(webCssPaths, webSources));
  violations.push(...checkSocialImageRouteParity(webSources));
  violations.push(...checkTypeScale(webCss));
  violations.push(...checkScallopPadding(webCss));
  violations.push(...checkGridGapsFit(webCss));
  violations.push(...checkUnusedCssRules(webCss, cssCodeSources));
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
