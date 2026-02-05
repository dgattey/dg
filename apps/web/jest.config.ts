import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Load next.config and .env files for the app
  dir: './',
});

// Path to @dg/testing package
const testingPackage = '../../packages/testing';

const config: Config = {
  coverageProvider: 'v8',
  globalSetup: `${testingPackage}/jest.globalSetup.ts`,
  globalTeardown: `${testingPackage}/jest.globalTeardown.ts`,
  roots: ['<rootDir>/src', '<rootDir>/../../packages'],
  setupFilesAfterEnv: [`${testingPackage}/jest.setup.ts`],
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};

export default createJestConfig(config);
