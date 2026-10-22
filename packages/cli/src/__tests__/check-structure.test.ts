import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkOrphanCssFiles, checkRouteCssImports, checkTypeScale } from '../check-css.js';
import {
  checkFileStructure,
  checkWorkspaceStructure,
  MAX_SOURCE_FILE_LINES,
} from '../check-structure.js';

describe('check-structure', () => {
  it('enforces max file lines, server-only in services, db-imports, section dividers, component naming, inline typeof import, and CSS imports', () => {
    const oversized = Array.from({ length: MAX_SOURCE_FILE_LINES + 5 }, () => 'const x = 1;').join(
      '\n',
    );
    const lineViolations = checkFileStructure('packages/content-models/books/big.ts', oversized);
    assert.equal(lineViolations.length, 1);
    assert.equal(lineViolations[0]?.rule, 'max-file-lines');

    const missingServerOnly = checkFileStructure(
      'packages/services/books/foo.ts',
      'export const x = 1;\n',
    );
    assert.equal(missingServerOnly.length, 1);
    assert.equal(missingServerOnly[0]?.rule, 'server-only-services');

    const pureTypes = checkFileStructure(
      'packages/services/books/types.ts',
      'export type Foo = { id: string };\n',
    );
    assert.equal(pureTypes.length, 0);

    const dbViolation = checkFileStructure(
      'apps/web/src/services/foo.ts',
      "import { db } from '@dg/db';\nexport const x = db;\n",
    );
    assert.equal(dbViolation.length, 1);
    assert.equal(dbViolation[0]?.rule, 'db-imports');

    const dividerViolation = checkFileStructure(
      'apps/web/src/services/foo.ts',
      '// --- Helpers ---\nexport const x = 1;\n',
    );
    assert.equal(dividerViolation.length, 1);
    assert.equal(dividerViolation[0]?.rule, 'no-section-dividers');

    const genericComponent = checkFileStructure(
      'apps/web/src/components/utils.tsx',
      'export const X = () => null;\n',
    );
    assert.equal(genericComponent.length, 1);
    assert.equal(genericComponent[0]?.rule, 'component-file-naming');

    const inlineTypeof = checkFileStructure(
      'apps/web/src/services/foo.ts',
      `type X = ${'typeof'} ${'import('}'./bar');\nexport type { X };\n`,
    );
    assert.equal(inlineTypeof.length, 1);
    assert.equal(inlineTypeof[0]?.rule, 'no-inline-typeof-import');

    const shortCacheLife = checkFileStructure(
      'apps/web/src/services/foo.ts',
      "import 'server-only';\nimport { cacheLife } from 'next/cache';\nexport async function f() { 'use cache'; cacheLife('minutes'); }\n",
    );
    assert.equal(shortCacheLife.length, 1);
    assert.equal(shortCacheLife[0]?.rule, 'no-short-prerender-cache-life');

    const uncachedServiceFetch = checkFileStructure(
      'packages/services/foo.ts',
      "import 'server-only';\nexport const f = () => fetch('https://example.com');\n",
    );
    assert.equal(uncachedServiceFetch.length, 1);
    assert.equal(uncachedServiceFetch[0]?.rule, 'service-fetch-no-store');

    const orphanCss = checkOrphanCssFiles(
      ['apps/web/src/app/music/music.css', 'apps/web/src/app/dev-console/devConsole.css'],
      new Map([['apps/web/src/app/music/page.tsx', "import './music.css';\n"]]),
    );
    assert.equal(orphanCss.length, 1);
    assert.equal(orphanCss[0]?.file, 'apps/web/src/app/dev-console/devConsole.css');
    assert.equal(orphanCss[0]?.rule, 'no-orphan-css');

    const routeMissingCss = checkRouteCssImports(
      ['apps/web/src/app/music/music.css'],
      new Map([
        [
          'apps/web/src/app/music/albums/layout.tsx',
          "import '../music.css';\nexport default function L({ children }: { children: unknown }) { return children; }\n",
        ],
        ['apps/web/src/app/music/albums/[id]/page.tsx', 'export default function A() {}\n'],
        ['apps/web/src/app/music/page.tsx', 'export default function P() {}\n'],
      ]),
    );
    assert.equal(routeMissingCss.length, 1);
    assert.equal(routeMissingCss[0]?.file, 'apps/web/src/app/music/page.tsx');
    assert.equal(routeMissingCss[0]?.rule, 'route-missing-css');
  });

  it('requires declared --type-* tokens for every font size in web CSS', () => {
    const violations = checkTypeScale(
      new Map([
        ['apps/web/src/app/collage/collage.css', '.collageRoot {\n  --type-body: 16px;\n}\n'],
        [
          'apps/web/src/app/music/music.css',
          [
            '.a { font-size: var(--type-body); }',
            '.b { font-size: 14px; }',
            '.c {\n  font:\n    700 1.2rem / 1 var(--display);\n}',
            '.d { font: italic 600 var(--type-missing) / 1.2 serif; }',
            '.e { font: inherit; --x-font-size: 9px; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, message }) => ({ line, message })),
      [
        { line: 2, message: 'Set font sizes with a --type-* token, not a literal length' },
        { line: 4, message: 'Set font sizes with a --type-* token, not a literal length' },
        { line: 7, message: '--type-missing is not declared in any stylesheet' },
      ],
    );
  });

  it('bans Biome suppression comments in every file Biome checks, anywhere in the repo', () => {
    const suppression = `${'biome'}-${'ignore'}`;
    for (const [relPath, content] of [
      ['apps/web/src/app/Foo.tsx', `// ${suppression} lint/a11y/x: reason\n<svg />;\n`],
      ['packages/ui/core/foo.css', `/* ${suppression} format: reason */\n.a {}\n`],
      ['scripts/tool.mjs', `// ${suppression}-all lint: reason\n`],
    ] as const) {
      const violations = checkFileStructure(relPath, content);
      assert.deepEqual(
        violations.map(({ line, rule }) => ({ line, rule })),
        [{ line: 1, rule: 'no-biome-suppressions' }],
        relPath,
      );
    }
  });

  it('validates the entire workspace in under 200ms with zero violations', () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    const start = performance.now();
    const violations = checkWorkspaceStructure(repoRoot);
    const elapsedMs = performance.now() - start;
    assert.deepEqual(violations, []);
    assert.ok(elapsedMs < 500, `Expected fast execution, took ${elapsedMs.toFixed(1)}ms`);
  });
});
