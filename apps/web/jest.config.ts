/** @jest-config-loader esbuild-register */
import { dbConfig } from '@dg/db/testing/jest.config.base';
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  ...dbConfig,
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);
