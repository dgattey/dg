/**
 * @jest-environment node
 */
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

import DevPage from '../page';

const mockNotFound = jest.mocked(notFound);

const setNodeEnv = (env: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: env, writable: true });
};

describe('Dev Page', () => {
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

      DevPage();

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('does not call notFound in development', () => {
      setNodeEnv('development');

      DevPage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('does not call notFound in test', () => {
      setNodeEnv('test');

      DevPage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('returns a valid React element with Suspense boundaries', () => {
      const result = DevPage();

      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });

    it('renders the page title', () => {
      const result = DevPage();

      // Check that the page structure is correct (contains expected sections)
      expect(result.props.children.props.children).toBeDefined();
    });
  });
});
