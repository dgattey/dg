/** @jest-config-loader esbuild-register */
import { baseConfig } from '@dg/testing/jest.config.base';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const sharedConfig: Config = {
  ...baseConfig,
  coverageProvider: 'v8',
  // Next.js 16 patches setImmediate; Jest leak detection recurses via promisify in tests.
  detectLeaks: false,
};

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
