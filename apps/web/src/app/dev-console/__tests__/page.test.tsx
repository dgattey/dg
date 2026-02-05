/**
 * @jest-environment node
 */
import { headers as nextHeaders } from 'next/headers';
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import ConsolePage from '../page';

const mockNotFound = jest.mocked(notFound);
const mockHeaders = jest.mocked(nextHeaders);

const setNodeEnv = (env: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: env, writable: true });
};

const setAuthEnv = (username?: string, password?: string) => {
  process.env.DEV_CONSOLE_BASIC_AUTH_USER = username ?? '';
  process.env.DEV_CONSOLE_BASIC_AUTH_PASS = password ?? '';
};

const setAuthorizationHeader = (value: string | null) => {
  mockHeaders.mockResolvedValue({
    get: (name: string) => (name.toLowerCase() === 'authorization' ? value : null),
  } as unknown as Headers);
};

const createBasicAuthHeader = (username: string, password: string) => {
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
  return `Basic ${token}`;
};

describe('Dev console page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setNodeEnv('production');
    setAuthEnv('dev', 'console');
    setAuthorizationHeader(null);
  });

  afterEach(() => {
    setNodeEnv('test');
    setAuthEnv();
  });

  describe('auth gating', () => {
    it('calls notFound when auth header is missing in production', async () => {
      await ConsolePage();

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('does not call notFound when auth header is valid', async () => {
      setAuthorizationHeader(createBasicAuthHeader('dev', 'console'));

      await ConsolePage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it('allows access in development when credentials are not set', async () => {
      setNodeEnv('development');
      setAuthEnv();

      await ConsolePage();

      expect(mockNotFound).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('returns a valid React element when authorized', async () => {
      setAuthorizationHeader(createBasicAuthHeader('dev', 'console'));
      const result = await ConsolePage();

      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });
  });
});
