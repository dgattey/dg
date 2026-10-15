/** @jest-config-loader esbuild-register */
import { dbConfig } from '@dg/db/testing/jest.config.base';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

// Shared config that applies to all tests
const sharedConfig: Config = {
  ...dbConfig,
  coverageProvider: 'v8',
  // Next.js 16 patches setImmediate; Jest leak detection recurses via promisify in tests.
  detectLeaks: false,
};

// Auto-detect environment by file extension:
// - .test.tsx → jsdom (React components need DOM)
// - .test.ts → node (API routes, utilities)
// Jest 30.5 rejects maxWorkers inside a project, so it stays top-level only.
const { maxWorkers: _maxWorkers, ...projectConfig } = sharedConfig;

const config: Config = {
  ...sharedConfig,
  projects: [
    {
      ...projectConfig,
      displayName: 'components',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/**/*.test.tsx'],
    },
    {
      ...projectConfig,
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/**/*.test.ts'],
    },
  ],
};

export default createJestConfig(config);
