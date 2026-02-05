/**
 * @jest-environment node
 */
import { invariant } from '@dg/shared-core/assertions/invariant';
import { mockEnv } from '@dg/testing/mocks';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

const devConsoleUrl = 'https://example.com/dev-console';

const encode = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

const createRequest = ({
  auth,
  headers: extraHeaders,
}: { auth?: string; headers?: Record<string, string> } = {}) => {
  const headers = new Headers();
  if (auth) {
    headers.set('authorization', auth);
  }
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }
  return new NextRequest(devConsoleUrl, { headers });
};

describe('proxy', () => {
  describe('without credentials configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
        DEV_CONSOLE_BASIC_AUTH_USER: undefined,
      });
    });

    it('allows access in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      const response = proxy(createRequest());

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('redirects to home in production', () => {
      mockEnv({ NODE_ENV: 'production' });

      const response = proxy(createRequest());

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      invariant(location, 'Expected location header to be defined');
      expect(new URL(location).pathname).toBe('/');
    });
  });

  describe('with credentials configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: 'secret',
        DEV_CONSOLE_BASIC_AUTH_USER: 'admin',
      });
    });

    it('allows valid credentials through', () => {
      const response = proxy(createRequest({ auth: encode('admin', 'secret') }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('returns 401 with WWW-Authenticate for missing credentials', () => {
      const response = proxy(createRequest());

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
      expect(response.headers.get('Content-Type')).toBe('text/html');
    });

    it('returns meta refresh body that redirects home on auth cancel', async () => {
      const response = proxy(createRequest());
      const body = await response.text();

      expect(body).toContain('meta http-equiv="refresh"');
      expect(body).toContain('url=/');
    });

    it('returns 401 with WWW-Authenticate for wrong credentials', () => {
      const response = proxy(createRequest({ auth: encode('admin', 'wrong') }));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
    });

    it.each<{ desc: string; headers: Record<string, string> }>([
      { desc: 'RSC requests', headers: { rsc: '1' } },
      { desc: 'prefetch requests', headers: { 'next-router-prefetch': '1' } },
      { desc: 'purpose prefetch requests', headers: { purpose: 'prefetch' } },
    ])('returns 401 without WWW-Authenticate for $desc', ({ headers }) => {
      const response = proxy(createRequest({ headers }));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBeNull();
    });
  });

});
