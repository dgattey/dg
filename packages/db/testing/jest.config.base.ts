import { baseConfig } from '@dg/testing/jest.config.base';
import type { Config } from 'jest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

/**
 * Extended Jest config for packages that need database access.
 * Adds global setup (migrations + reset) and teardown on top of the shared base config.
 */
export const dbConfig: Config = {
  ...baseConfig,
  globalSetup: resolve(dir, 'jest.globalSetup.ts'),
  globalTeardown: resolve(dir, 'jest.globalTeardown.ts'),
};
