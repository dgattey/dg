/**
 * @jest-environment node
 */
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

import ConsolePage from '../page';

const mockNotFound = jest.mocked(notFound);

const setNodeEnv = (env: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: env, writable: true });
};

describe('Console Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setNodeEnv('development');
  });

  afterEach(() => {
    setNodeEnv('test');
  });

  describe('environment gating', () => {
    it('calls notFound in production', () => {
      setNodeEnv('production');

      ConsolePage();

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('does not call notFound in development', () => {
      setNodeEnv('development');

      ConsolePage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('does not call notFound in test', () => {
      setNodeEnv('test');

      ConsolePage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('returns a valid React element in non-production', () => {
      const result = ConsolePage();

      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });
  });
});
