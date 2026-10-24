import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkCacheTagParity } from '../check-cache-tags.js';
import {
  checkOrphanCssFiles,
  checkRouteCssImports,
  checkTypeScale,
  checkUnusedCssRules,
} from '../check-css.js';
import { checkNoPageSubtitles } from '../check-page-titles.js';
import {
  checkFileStructure,
  checkSocialImageRouteParity,
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

    const dbPkg = `@dg/${'db'}`;
    const dbViolation = checkFileStructure(
      'apps/web/src/services/foo.ts',
      `import { db } from '${dbPkg}';\nexport const x = db;\n`,
    );
    assert.equal(dbViolation.length, 1);
    assert.equal(dbViolation[0]?.rule, 'db-imports');

    const webTestDbViolation = checkFileStructure(
      'apps/web/src/app/__tests__/foo.test.ts',
      `import { setupTestDatabase } from '${dbPkg}/testing/databaseSetup';\nexport const x = setupTestDatabase;\n`,
    );
    assert.equal(webTestDbViolation.length, 1);
    assert.equal(webTestDbViolation[0]?.rule, 'db-imports');

    const webJestConfigDbViolation = checkFileStructure(
      'apps/web/jest.config.ts',
      `import { dbConfig } from '${dbPkg}/testing/jest.config.base';\nexport default dbConfig;\n`,
    );
    assert.equal(webJestConfigDbViolation.length, 1);
    assert.equal(webJestConfigDbViolation[0]?.rule, 'db-imports');

    const migrateStampViolation = checkFileStructure(
      'packages/db/scripts/runMigrate.ts',
      "import { execSync } from 'node:child_process';\nexecSync('pnpm exec sequelize-cli db:migrate');\n",
    );
    assert.equal(migrateStampViolation.length, 1);
    assert.equal(migrateStampViolation[0]?.rule, 'migrate-stamp-cache');

    const migrationTxViolation = checkFileStructure(
      'packages/db/migrations/20260101000000-bad.js',
      "module.exports = {\n  async up(queryInterface) {\n    const transaction = await queryInterface.sequelize.transaction();\n    await queryInterface.createTable('Foo', {});\n    await transaction.commit();\n  },\n};\n",
    );
    assert.equal(migrationTxViolation.length, 1);
    assert.equal(migrationTxViolation[0]?.rule, 'migration-transaction');

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

    const contentfulFallbackViolation = checkFileStructure(
      'packages/services/contentful/fetchFooterContent.ts',
      "import 'server-only';\nconst FALLBACK_FOOTER_LINKS = [];\nexport const f = () => FALLBACK_FOOTER_LINKS;\n",
    );
    assert.equal(contentfulFallbackViolation.length, 2);
    assert.equal(contentfulFallbackViolation[0]?.rule, 'no-contentful-fallbacks');

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
          'apps/web/src/app/music/albums/page.tsx',
          "import '../music.css';\nexport default function A() {}\n",
        ],
        ['apps/web/src/app/music/page.tsx', 'export default function P() {}\n'],
      ]),
    );
    assert.equal(routeMissingCss.length, 1);
    assert.equal(routeMissingCss[0]?.file, 'apps/web/src/app/music/page.tsx');
    assert.equal(routeMissingCss[0]?.rule, 'route-missing-css');

    const routeMissingSocialImages = checkSocialImageRouteParity(
      new Map([
        ['apps/web/src/app/page.tsx', 'export default function Home() {}\n'],
        ['apps/web/src/app/opengraph-image.tsx', 'export default function Og() {}\n'],
        ['apps/web/src/app/twitter-image.tsx', 'export default function Tw() {}\n'],
        ['apps/web/src/app/reading/page.tsx', 'export default function Reading() {}\n'],
        ['apps/web/src/app/reading/opengraph-image.tsx', 'export default function Og() {}\n'],
        ['apps/web/src/app/dev-console/page.tsx', 'export default function DevConsole() {}\n'],
      ]),
    );
    assert.deepEqual(routeMissingSocialImages, [
      {
        file: 'apps/web/src/app/reading/page.tsx',
        line: 1,
        message:
          'Public page route "apps/web/src/app/reading" is missing "apps/web/src/app/reading/twitter-image.tsx"',
        rule: 'og-image-route-parity',
      },
    ]);

    const cacheTagViolations = checkCacheTagParity(
      new Map([
        [
          'apps/web/src/services/orphanMax.ts',
          "import { cacheLife, cacheTag } from 'next/cache';\nconst ORPHAN_TAG = 'orphan-tag';\nexport async function getOrphan() {\n  'use cache';\n  cacheLife('max');\n  cacheTag(ORPHAN_TAG);\n  return 1;\n}\n",
        ],
        [
          'apps/web/src/app/api/sync/route.ts',
          "import { revalidateTag } from 'next/cache';\nexport function POST() {\n  revalidateTag('typo-tag', 'max');\n}\n",
        ],
        [
          'apps/web/src/services/github.ts',
          "import { version } from '../../../../package.json';\nexport const v = version;\n",
        ],
      ]),
    );
    assert.deepEqual(
      cacheTagViolations.map(({ file, line, rule }) => ({ file, line, rule })),
      [
        {
          file: 'apps/web/src/services/github.ts',
          line: 1,
          rule: 'no-package-json-version-import',
        },
        { file: 'apps/web/src/services/orphanMax.ts', line: 6, rule: 'cache-tag-parity' },
        { file: 'apps/web/src/app/api/sync/route.ts', line: 3, rule: 'cache-tag-parity' },
      ],
    );

    const unusedCssViolations = checkUnusedCssRules(
      new Map([
        [
          'apps/web/src/app/collage/collage.css',
          '.usedCard { color: red; }\n.deadCard { color: blue; }\n@keyframes deadSpin { to { rotate: 1turn; } }\n',
        ],
      ]),
      new Map([
        [
          'apps/web/src/app/Home.tsx',
          'export const Home = () => <div className="usedCard phantomClass" />;\n',
        ],
      ]),
    );
    assert.deepEqual(
      unusedCssViolations.map(({ file, line, rule }) => ({ file, line, rule })),
      [
        { file: 'apps/web/src/app/collage/collage.css', line: 2, rule: 'no-unused-css-class' },
        { file: 'apps/web/src/app/collage/collage.css', line: 3, rule: 'no-unused-css-keyframes' },
        { file: 'apps/web/src/app/Home.tsx', line: 1, rule: 'no-undefined-css-class' },
      ],
    );
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
            '.f { font-family: Georgia, serif; font-weight: 800; }',
            '.g { font: 500 var(--type-body) / 1.2 var(--body); font-weight: 600; }',
            '@font-face { font-family: fallback; font-weight: 300; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, message }) => ({ line, message })),
      [
        { line: 9, message: 'Set font-family to var(--display) or var(--body)' },
        { line: 7, message: 'End the font shorthand with var(--display) or var(--body)' },
        { line: 10, message: 'Font weight 500 is off the 400/600/700 palette' },
        { line: 9, message: 'Font weight 800 is off the 400/600/700 palette' },
        { line: 2, message: 'Set font sizes with a --type-* token, not a literal length' },
        { line: 4, message: 'Set font sizes with a --type-* token, not a literal length' },
        { line: 7, message: '--type-missing is not declared in any stylesheet' },
      ],
    );
  });

  it('flags a paragraph set directly under a CutLetters page title', () => {
    const violations = checkNoPageSubtitles(
      new Map([
        [
          'apps/web/src/app/a/page.tsx',
          '<div>\n  <CutLetters className="collagePageTitle" text={TITLE} />\n  <p className="a__lede">Hi</p>\n</div>',
        ],
        [
          'apps/web/src/app/b/page.tsx',
          '<CutLetters className="collagePageTitle" text="B" />\n<Suspense><p>Body</p></Suspense>',
        ],
        [
          'apps/web/src/app/c/IntroCard.tsx',
          '<CutLetters className="home__headline" text={headline} />\n<p>Intro</p>',
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ file, line, rule }) => ({ file, line, rule })),
      [{ file: 'apps/web/src/app/a/page.tsx', line: 2, rule: 'no-page-subtitle' }],
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

  it('validates the entire workspace in under 1500ms with zero violations', () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    const start = performance.now();
    const violations = checkWorkspaceStructure(repoRoot);
    const elapsedMs = performance.now() - start;
    assert.deepEqual(violations, []);
    assert.ok(elapsedMs < 1500, `Expected fast execution, took ${elapsedMs.toFixed(1)}ms`);
  });

  it('exports valid Sequelize CLI environments from packages/db/database.config.mts', async () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    const configUrl = pathToFileURL(path.join(repoRoot, 'packages/db/database.config.mts')).href;
    const configModule = (await import(configUrl)) as {
      default?: Record<string, { dialect?: string; use_env_variable?: string }>;
    };
    assert.equal(configModule.default?.development?.dialect, 'postgres');
    assert.equal(configModule.default?.development?.use_env_variable, 'DATABASE_URL');
    assert.equal(configModule.default?.production?.dialect, 'postgres');
    assert.equal(configModule.default?.production?.use_env_variable, 'DATABASE_URL');
    assert.equal(configModule.default?.test?.dialect, 'postgres');
    assert.equal(configModule.default?.test?.use_env_variable, 'DATABASE_URL_TEST');
  });
});
