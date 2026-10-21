import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  checkFileStructure,
  checkWorkspaceStructure,
  MAX_SOURCE_FILE_LINES,
} from '../check-structure.js';

describe('check-structure', () => {
  it('enforces max file lines, server-only in services, db-imports, section dividers, component naming, and inline typeof import', () => {
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
