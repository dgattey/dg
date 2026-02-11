import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from 'jest';

const dir = dirname(fileURLToPath(import.meta.url));

// Resolve @swc/jest from this package so consuming packages don't need it as a direct dep
const require = createRequire(import.meta.url);
const swcJestPath = require.resolve('@swc/jest');

/**
 * SWC transform for TypeScript files. Matches Next.js settings (decorators,
 * esnext target, automatic JSX runtime). Used by all packages except @dg/web
 * which gets its own SWC transform via next/jest.
 */
const swcTransform: Config['transform'] = {
  '^.+\\.tsx?$': [
    swcJestPath,
    {
      jsc: {
        parser: { decorators: true, syntax: 'typescript', tsx: true },
        target: 'esnext',
        transform: { react: { runtime: 'automatic' } },
      },
      module: { type: 'es6' },
    },
  ],
};

/**
 * Base Jest config shared by all packages.
 * Provides common testMatch pattern, TypeScript transform, and setup files.
 */
export const baseConfig: Config = {
  maxWorkers: '50%',
  moduleNameMapper: {
    // Mock server-only to a no-op (next/jest does this automatically for @dg/web)
    'server-only': resolve(dir, 'server-only-mock.js'),
  },
  setupFilesAfterEnv: [resolve(dir, 'jest.setup.ts')],
  silent: true,
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transform: swcTransform,
};
