/**
 * @jest-environment node
 */
import { mockEnv } from '@dg/testing/mocks';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

const devConsoleUrl = 'https://example.com/dev-console';

const encode = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

const requestWithAuth = (auth: string | null) => {
  const headers = new Headers();
  if (auth) {
    headers.set('authorization', auth);
  }
  return new NextRequest(devConsoleUrl, { headers });
};

describe('proxy', () => {
  describe('when credentials are configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: 'secret',
        DEV_CONSOLE_BASIC_AUTH_USER: 'admin',
      });
    });

    it('allows valid credentials through', () => {
      const response = proxy(requestWithAuth(encode('admin', 'secret')));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('returns 401 with WWW-Authenticate for missing credentials', () => {
      const response = proxy(requestWithAuth(null));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
    });

    it('returns 401 with WWW-Authenticate for wrong credentials', () => {
      const response = proxy(requestWithAuth(encode('admin', 'wrong')));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
    });
  });

  describe('when credentials are not configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
        DEV_CONSOLE_BASIC_AUTH_USER: undefined,
      });
    });

    it('allows access in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      const response = proxy(requestWithAuth(null));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('redirects to home in production', () => {
      mockEnv({ NODE_ENV: 'production' });

      const response = proxy(requestWithAuth(null));

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe('/');
    });
  });
});
