import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Load next.config and .env files for the app
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  roots: ['<rootDir>/src', '<rootDir>/../../packages'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
};

export default createJestConfig(config);
