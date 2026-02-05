/** @jest-config-loader esbuild-register */
import { baseConfig } from '@dg/testing/jest.config.base';

export default { ...baseConfig, testEnvironment: 'node' };
