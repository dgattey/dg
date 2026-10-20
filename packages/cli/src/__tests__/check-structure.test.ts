import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkCssClassesAndVariables, checkOrphanCssFiles } from '../check-css.js';
import {
  checkFileStructure,
  checkRouteCssImports,
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

    const orphanCss = checkOrphanCssFiles(
      ['apps/web/src/app/music/music.css', 'apps/web/src/app/dev-console/devConsole.css'],
      new Map([['apps/web/src/app/music/page.tsx', "import './music.css';\n"]]),
    );
    assert.equal(orphanCss.length, 1);
    assert.equal(orphanCss[0]?.file, 'apps/web/src/app/dev-console/devConsole.css');
    assert.equal(orphanCss[0]?.rule, 'no-orphan-css');

    const cssAuditViolations = checkCssClassesAndVariables(
      new Map([
        [
          'apps/web/src/app/music/music.css',
          '.musicHeader { color: var(--defined-tone); }\n.deadRule { color: var(--missing-tone); }\n',
        ],
      ]),
      new Map([
        [
          'apps/web/src/app/music/page.tsx',
          'export const P = () => <div className="musicHeader typoClass" style={{ "--defined-tone": "#000" }} />;\n',
        ],
      ]),
    );
    const rules = cssAuditViolations.map((v) => v.rule).sort();
    assert.deepEqual(rules, ['undefined-css-class', 'undefined-css-variable', 'unused-css-class']);

    const routeMissingCss = checkRouteCssImports(
      new Map([['apps/web/src/app/music/music.css', '.music__grid { display: grid; }\n']]),
      new Map([
        [
          'apps/web/src/app/music/albums/layout.tsx',
          "import '../music.css';\nexport default function L({ children }: { children: unknown }) { return children; }\n",
        ],
        [
          'apps/web/src/app/music/page.tsx',
          'export default function P() { return <div className="music__grid" />; }\n',
        ],
      ]),
    );
    assert.equal(routeMissingCss.length, 1);
    assert.equal(routeMissingCss[0]?.file, 'apps/web/src/app/music/page.tsx');
    assert.equal(routeMissingCss[0]?.rule, 'route-missing-css');
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
