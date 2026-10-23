import { invariant } from '@dg/shared-core/assertions/invariant';
import { mockEnv } from '@dg/testing/mocks';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { config, proxy } from '../proxy';

const devConsoleUrl = 'https://example.com/dev-console';

const encode = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

const createRequest = ({
  auth,
  headers: extraHeaders,
  url = devConsoleUrl,
}: {
  auth?: string;
  headers?: Record<string, string>;
  url?: string;
} = {}) => {
  const headers = new Headers();
  if (auth) {
    headers.set('authorization', auth);
  }
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }
  return new NextRequest(url, { headers });
};

describe('proxy', () => {
  describe('markdown negotiation on public pages', () => {
    it('does not 406 Flight resumes that lack the stripped rsc header', () => {
      const response = proxy(
        new NextRequest('https://example.com/', {
          headers: { accept: 'text/x-component' },
        }),
      );

      expect(response.status).not.toBe(406);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('attaches Link discovery headers on public pages', () => {
      const response = proxy(
        new NextRequest('https://example.com/music', {
          headers: { accept: 'text/html' },
        }),
      );

      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('Link')).toContain('/music.md');
    });

    it('rewrites unmatched page paths to the prerendered /not-found shell', () => {
      const response = proxy(
        new NextRequest('https://example.com/sample-page', {
          headers: { accept: 'text/html' },
        }),
      );

      expect(response.headers.get('x-middleware-rewrite')).toBe('https://example.com/not-found');
    });
  });

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
      { desc: 'Flight Accept without rsc header', headers: { accept: 'text/x-component' } },
      { desc: 'prefetch requests', headers: { 'next-router-prefetch': '1' } },
      { desc: 'purpose prefetch requests', headers: { purpose: 'prefetch' } },
    ])('returns 401 without WWW-Authenticate for $desc', ({ headers }) => {
      const response = proxy(createRequest({ headers }));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBeNull();
    });
  });
});

describe('proxy matcher', () => {
  const matches = (path: string, headers?: Record<string, string>) =>
    unstable_doesMiddlewareMatch({
      config,
      headers,
      url: `https://example.com${path}`,
    });

  it.each([
    '/',
    '/music',
    '/music/albums',
    '/music.md',
    '/index.md',
    '/dev-console',
    '/dev-console/oauth',
  ])('runs on %s', (path) => {
    expect(matches(path)).toBe(true);
  });

  it.each<{ desc: string; headers: Record<string, string>; path: string }>([
    { desc: 'RSC flight request on /', headers: { rsc: '1' }, path: '/' },
    {
      desc: 'router prefetch on /music',
      headers: { 'next-router-prefetch': '1' },
      path: '/music',
    },
    {
      desc: 'purpose prefetch on /reading',
      headers: { purpose: 'prefetch' },
      path: '/reading',
    },
  ])('skips public-page $desc', ({ headers, path }) => {
    expect(matches(path, headers)).toBe(false);
  });

  it.each<{ desc: string; headers: Record<string, string> }>([
    { desc: 'RSC flight request', headers: { rsc: '1' } },
    { desc: 'router prefetch', headers: { 'next-router-prefetch': '1' } },
    { desc: 'purpose prefetch', headers: { purpose: 'prefetch' } },
  ])('still runs on /dev-console for $desc', ({ headers }) => {
    expect(matches('/dev-console', headers)).toBe(true);
    expect(matches('/dev-console/oauth', headers)).toBe(true);
  });

  it.each([
    '/_next/static/chunks/app.js',
    '/api/spotify/sync',
    '/.well-known/openapi.json',
    '/.well-known/agent-skills/index.json',
    '/.well-known/agent-skills/dg/SKILL.md',
    '/llm-markdown/music',
    '/llms.txt',
    '/llms-full.txt',
    '/robots.txt',
    '/sitemap.xml',
    '/opengraph-image',
    '/twitter-image-abc123',
    '/manifest.webmanifest',
    '/favicon.ico',
    '/wp-login.php',
    '/.env',
  ])('skips %s', (path) => {
    expect(matches(path)).toBe(false);
  });
});
