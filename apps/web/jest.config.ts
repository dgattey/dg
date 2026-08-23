/** @jest-config-loader esbuild-register */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbConfig } from '@dg/db/testing/jest.config.base';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });
const require = createRequire(import.meta.url);

const imageAssetStub = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../packages/testing/file-stub.cjs',
);

// Shared config that applies to all tests
const sharedConfig: Config = {
  ...dbConfig,
  coverageProvider: 'v8',
  // Next.js 16 patches setImmediate; Jest leak detection recurses via promisify in tests.
  detectLeaks: false,
  moduleNameMapper: {
    ...dbConfig.moduleNameMapper,
    '\\.(avif|webp|png|jpg|jpeg|gif|svg)$': imageAssetStub,
    '\\.module\\.css$': require.resolve('identity-obj-proxy'),
  },
};

// Auto-detect environment by file extension:
// - .test.tsx → jsdom (React components need DOM)
// - .test.ts → node (API routes, utilities)
const config: Config = {
  ...sharedConfig,
  projects: [
    {
      ...sharedConfig,
      displayName: 'components',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/**/*.test.tsx'],
    },
    {
      ...sharedConfig,
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/**/*.test.ts'],
    },
  ],
};

export default createJestConfig(config);
