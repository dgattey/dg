/** @jest-config-loader esbuild-register */
import { dbConfig } from '@dg/db/testing/jest.config.base';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  ...dbConfig,
  coverageProvider: 'v8',
  // Next.js 16 patches setImmediate; Jest leak detection recurses via promisify in tests.
  detectLeaks: false,
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);
