import type { StructureViolation } from './check-structure.js';

function isTestPath(relPath: string): boolean {
  return (
    relPath.includes('__tests__/') ||
    /\.test\.(ts|tsx)$/.test(relPath) ||
    relPath.endsWith('jest.config.ts')
  );
}

function resolveStaticTagArg(rawArg: string, constMap: ReadonlyMap<string, string>): string | null {
  const trimmed = rawArg.trim();
  const literalMatch = /^['"]([^'"]+)['"]$/.exec(trimmed);
  if (literalMatch?.[1]) {
    return literalMatch[1];
  }
  return constMap.get(trimmed) ?? null;
}

export function checkCacheTagParity(
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  const declaredCacheTags = new Set<string>();
  const revalidatedTags = new Set<string>();
  const maxCacheTagRefs: Array<{ file: string; line: number; tag: string }> = [];
  const revalidateTagRefs: Array<{ file: string; line: number; tag: string }> = [];

  for (const [relPath, content] of sourceFiles) {
    if (isTestPath(relPath)) {
      continue;
    }
    const constMap = new Map<string, string>();
    for (const match of content.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([^'"]+)['"]/g)) {
      if (match[1] && match[2]) {
        constMap.set(match[1], match[2]);
      }
    }

    const lines = content.split('\n');
    let inMaxCacheScope = false;
    let maxCacheLine = 0;
    let maxCacheTagsInScope = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const lineText = lines[i] ?? '';
      const lineNum = i + 1;

      if (
        relPath !== 'apps/web/src/services/version.ts' &&
        /\bfrom\s+['"][^'"]*package\.json['"]/.test(lineText)
      ) {
        violations.push({
          file: relPath,
          line: lineNum,
          message:
            'Import getAppVersionInfo from apps/web/src/services/version.ts instead of reading version from package.json directly',
          rule: 'no-package-json-version-import',
        });
      }

      if (/\bcacheLife\(\s*['"]max['"]\s*\)/.test(lineText)) {
        inMaxCacheScope = true;
        maxCacheLine = lineNum;
        maxCacheTagsInScope = 0;
      }

      for (const match of lineText.matchAll(/\bcacheTag\(\s*([^)]+?)\s*\)/g)) {
        const resolved = resolveStaticTagArg(match[1] ?? '', constMap);
        if (!resolved) {
          violations.push({
            file: relPath,
            line: lineNum,
            message: 'cacheTag(...) must use a string literal or local string constant',
            rule: 'cache-tag-parity',
          });
          continue;
        }
        declaredCacheTags.add(resolved);
        if (inMaxCacheScope) {
          maxCacheTagsInScope += 1;
          maxCacheTagRefs.push({ file: relPath, line: lineNum, tag: resolved });
        }
      }

      if (inMaxCacheScope && lineText.includes('}')) {
        if (maxCacheTagsInScope === 0) {
          violations.push({
            file: relPath,
            line: maxCacheLine,
            message:
              "cacheLife('max') function must attach at least one cacheTag(...) so on-demand revalidation can update it",
            rule: 'cache-tag-parity',
          });
        }
        inMaxCacheScope = false;
      }

      for (const match of lineText.matchAll(
        /\brevalidateTag\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)/g,
      )) {
        const tagArg = match[1] ?? '';
        const profileArg = (match[2] ?? '').trim();
        if (profileArg !== "'max'" && profileArg !== '"max"') {
          violations.push({
            file: relPath,
            line: lineNum,
            message: "revalidateTag(...) must pass 'max' as its second argument",
            rule: 'cache-tag-parity',
          });
        }
        const resolved = resolveStaticTagArg(tagArg, constMap);
        if (!resolved) {
          violations.push({
            file: relPath,
            line: lineNum,
            message: 'revalidateTag(...) must use a string literal or local string constant',
            rule: 'cache-tag-parity',
          });
          continue;
        }
        revalidatedTags.add(resolved);
        revalidateTagRefs.push({ file: relPath, line: lineNum, tag: resolved });
      }
    }
  }

  for (const ref of maxCacheTagRefs) {
    if (!revalidatedTags.has(ref.tag)) {
      violations.push({
        file: ref.file,
        line: ref.line,
        message: `cacheTag("${ref.tag}") on a cacheLife('max') function has no matching revalidateTag("${ref.tag}", 'max') call in apps/web/src`,
        rule: 'cache-tag-parity',
      });
    }
  }

  for (const ref of revalidateTagRefs) {
    if (!declaredCacheTags.has(ref.tag)) {
      violations.push({
        file: ref.file,
        line: ref.line,
        message: `revalidateTag("${ref.tag}", 'max') does not match any cacheTag("${ref.tag}") in apps/web/src`,
        rule: 'cache-tag-parity',
      });
    }
  }

  return violations;
}

const BANNED_CONTENTFUL_FALLBACK_PATTERN =
  /\b(?:FALLBACK_|NORMALIZED_|DEFAULT_DESCRIPTION|DEFAULT_ENCODED_EMAIL|normalizeFooterDescription|cleanBookTitle)\w*|\bprocess\.env\.CONTENTFUL_/;
const MAPLIBRE_TOKEN = ['maplibre', 'gl'].join('-');

export function checkContentfulFallbacks(
  relPath: string,
  content: string,
  lines?: ReadonlyArray<string>,
): Array<StructureViolation> {
  if (isTestPath(relPath)) {
    return [];
  }
  const sourceLines = lines ?? content.split('\n');
  const maplibreViolations =
    !relPath.startsWith('packages/cli/') && content.includes(MAPLIBRE_TOKEN)
      ? sourceLines.flatMap((lineText, i) =>
          lineText.includes(MAPLIBRE_TOKEN)
            ? [
                {
                  file: relPath,
                  line: i + 1,
                  message: 'Use pigeon-maps instead of maplibre',
                  rule: 'no-maplibre-gl',
                },
              ]
            : [],
        )
      : [];
  if (
    (!/^packages\/services\/contentful\/fetch.*\.ts$/.test(relPath) &&
      !/^packages\/content-models\/contentful\/renderables\/.*\.ts$/.test(relPath) &&
      relPath !== 'apps/web/src/app/layouts/Footer.tsx') ||
    !BANNED_CONTENTFUL_FALLBACK_PATTERN.test(content)
  ) {
    return maplibreViolations;
  }
  return [
    ...maplibreViolations,
    ...sourceLines.flatMap((lineText, i) =>
      BANNED_CONTENTFUL_FALLBACK_PATTERN.test(lineText)
        ? [
            {
              file: relPath,
              line: i + 1,
              message:
                'Read Contentful entries directly without hardcoded fallback constants, env-var bypasses, or runtime copy rewrites',
              rule: 'no-contentful-fallbacks',
            },
          ]
        : [],
    ),
  ];
}

export function checkMigrationTransactions(
  relPath: string,
  content: string,
): Array<StructureViolation> {
  if (!content.includes('sequelize.transaction(')) {
    return [];
  }
  const violations: Array<StructureViolation> = [];
  const methodBlocks = content.split(/\basync\s+(?:up|down)\s*\(/).slice(1);
  for (const block of methodBlocks) {
    if (!block.includes('sequelize.transaction(')) {
      continue;
    }
    const callPattern =
      /await\s+queryInterface\.(?:createTable|dropTable|addColumn|removeColumn|addIndex|removeIndex|sequelize\.query)\s*\(([\s\S]*?)\)\s*;/g;
    for (const match of block.matchAll(callPattern)) {
      const argsText = match[1] ?? '';
      if (!/\btransaction\b/.test(argsText)) {
        const offsetInContent = content.indexOf(match[0]);
        const line =
          offsetInContent >= 0 ? content.slice(0, offsetInContent).split('\n').length : 1;
        violations.push({
          file: relPath,
          line,
          message:
            'queryInterface calls inside a queryInterface.sequelize.transaction() block must pass { transaction } so single-connection pools do not deadlock',
          rule: 'migration-transaction',
        });
      }
    }
  }
  return violations;
}
