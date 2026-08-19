import { invariant } from '@dg/shared-core/assertions/invariant';
import { mockEnv } from '@dg/testing/mocks';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

const devConsoleUrl = 'https://example.com/dev-console';

const mockInteractiveRedesign = jest.fn<Promise<boolean>, [unknown]>();

jest.mock('../flags', () => ({
  interactiveRedesign: (request: unknown) => mockInteractiveRedesign(request),
}));

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
  beforeEach(() => {
    mockInteractiveRedesign.mockResolvedValue(false);
    mockEnv({ GREENHOUSE_PREVIEW: undefined });
  });

  describe('markdown negotiation on public pages', () => {
    it('does not 406 Flight resumes that lack the stripped rsc header', async () => {
      const response = await proxy(
        new NextRequest('https://example.com/', {
          headers: { accept: 'text/x-component' },
        }),
      );

      expect(response.status).not.toBe(406);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('greenhouse rewrite', () => {
    it('leaves flag-off `/` on the public homepage', async () => {
      const response = await proxy(createRequest({ url: 'https://example.com/' }));

      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('Link')).toContain('/index.md');
    });

    it('rewrites flag-on `/` to the internal greenhouse homepage', async () => {
      mockInteractiveRedesign.mockResolvedValue(true);

      const response = await proxy(createRequest({ url: 'https://example.com/' }));

      expect(response.headers.get('x-middleware-rewrite')).toContain('/greenhouse/home');
      expect(response.headers.get('Link')).toContain('/index.md');
    });

    it('does not rewrite music destinations', async () => {
      mockInteractiveRedesign.mockResolvedValue(true);

      const music = await proxy(createRequest({ url: 'https://example.com/music' }));
      const albums = await proxy(
        createRequest({ url: 'https://example.com/music/albums?album=x' }),
      );

      expect(music.headers.get('x-middleware-rewrite')).toBeNull();
      expect(albums.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('redirects a direct hit on the internal homepage', async () => {
      const response = await proxy(createRequest({ url: 'https://example.com/greenhouse/home' }));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      invariant(location, 'Expected location header to be defined');
      expect(new URL(location).pathname).toBe('/');
    });
  });

  describe('without credentials configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
        DEV_CONSOLE_BASIC_AUTH_USER: undefined,
      });
    });

    it('allows access in development', async () => {
      mockEnv({ NODE_ENV: 'development' });

      const response = await proxy(createRequest());

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('redirects to home in production', async () => {
      mockEnv({ NODE_ENV: 'production' });

      const response = await proxy(createRequest());

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

    it('allows valid credentials through', async () => {
      const response = await proxy(createRequest({ auth: encode('admin', 'secret') }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('returns 401 with WWW-Authenticate for missing credentials', async () => {
      const response = await proxy(createRequest());

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
      expect(response.headers.get('Content-Type')).toBe('text/html');
    });

    it('returns meta refresh body that redirects home on auth cancel', async () => {
      const response = await proxy(createRequest());
      const body = await response.text();

      expect(body).toContain('meta http-equiv="refresh"');
      expect(body).toContain('url=/');
    });

    it('returns 401 with WWW-Authenticate for wrong credentials', async () => {
      const response = await proxy(createRequest({ auth: encode('admin', 'wrong') }));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Basic realm="Dev Console"');
    });

    it.each<{ desc: string; headers: Record<string, string> }>([
      { desc: 'RSC requests', headers: { rsc: '1' } },
      { desc: 'Flight Accept without rsc header', headers: { accept: 'text/x-component' } },
      { desc: 'prefetch requests', headers: { 'next-router-prefetch': '1' } },
      { desc: 'purpose prefetch requests', headers: { purpose: 'prefetch' } },
    ])('returns 401 without WWW-Authenticate for $desc', async ({ headers }) => {
      const response = await proxy(createRequest({ headers }));

      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBeNull();
    });
  });
});
