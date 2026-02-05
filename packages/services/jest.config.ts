/** @jest-config-loader esbuild-register */
import { dbConfig } from '@dg/db/testing/jest.config.base';

export default { ...dbConfig, testEnvironment: 'node' };
