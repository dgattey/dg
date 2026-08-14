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
}: {
  auth?: string;
  headers?: Record<string, string>;
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
  return new NextRequest(devConsoleUrl, { headers });
};

const createPageRequest = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://example.com${path}`, { headers });

beforeEach(() => {
  mockInteractiveRedesign.mockReset();
  mockInteractiveRedesign.mockResolvedValue(false);
});

describe('proxy', () => {
  describe('homepage layout routing', () => {
    it('serves / itself when the flag is off', async () => {
      const response = await proxy(createPageRequest('/', { accept: 'text/html' }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('rewrites / to a seeded island from the prerendered deck when the flag is on', async () => {
      mockInteractiveRedesign.mockResolvedValue(true);

      const paths = new Set<string>();
      for (let i = 0; i < 24; i++) {
        const response = await proxy(createPageRequest('/', { accept: 'text/html' }));
        const rewrite = response.headers.get('x-middleware-rewrite') ?? '';
        expect(rewrite).toMatch(/\/interactive-home\/s\/\d+/);
        paths.add(rewrite);
      }
      expect(paths.size).toBeGreaterThan(1);
    });

    it('keeps the Markdown alternate advertised on the rewritten homepage', async () => {
      mockInteractiveRedesign.mockResolvedValue(true);

      const response = await proxy(createPageRequest('/', { accept: 'text/html' }));

      expect(response.headers.get('Link')).toContain('/index.md');
      expect(response.headers.get('Vary')).toContain('Accept');
    });

    it('rewrites RSC navigations to / so client routing matches the document', async () => {
      mockInteractiveRedesign.mockResolvedValue(true);

      const response = await proxy(createPageRequest('/', { accept: 'text/x-component' }));

      expect(response.headers.get('x-middleware-rewrite')).toMatch(/\/interactive-home\/s\/\d+/);
    });

    it('evaluates the flag against the incoming request, not ambient headers', async () => {
      await proxy(createPageRequest('/', { accept: 'text/html' }));

      expect(mockInteractiveRedesign).toHaveBeenCalledTimes(1);
      const [passedRequest] = mockInteractiveRedesign.mock.calls[0] ?? [];
      expect(passedRequest).toBeInstanceOf(NextRequest);
    });

    it('does not evaluate the flag for other pages', async () => {
      await proxy(createPageRequest('/music', { accept: 'text/html' }));

      expect(mockInteractiveRedesign).not.toHaveBeenCalled();
    });

    it('redirects a direct hit on the interactive route back home', async () => {
      const response = await proxy(createPageRequest('/interactive-home'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      invariant(location, 'Expected location header to be defined');
      expect(new URL(location).pathname).toBe('/');
    });

    it('redirects a direct hit on a seeded island back home', async () => {
      const response = await proxy(createPageRequest('/interactive-home/s/123'));

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      invariant(location, 'Expected location header to be defined');
      expect(new URL(location).pathname).toBe('/');
    });

    it('serves Markdown without consulting the flag', async () => {
      const response = await proxy(createPageRequest('/index.md'));

      expect(response.headers.get('x-middleware-rewrite')).toContain('/llm-markdown');
      expect(mockInteractiveRedesign).not.toHaveBeenCalled();
    });
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

    it('adds Link and Vary on HTML responses for public pages', async () => {
      const response = await proxy(createPageRequest('/music', { accept: 'text/html' }));

      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('Link')).toContain('/music.md');
      expect(response.headers.get('Vary')).toContain('Accept');
    });

    it('returns 406 when no produced type is acceptable', async () => {
      const response = await proxy(createPageRequest('/', { accept: 'application/pdf' }));

      expect(response.status).toBe(406);
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
