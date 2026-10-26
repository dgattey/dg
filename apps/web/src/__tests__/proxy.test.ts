import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { config, proxy } from '../proxy';

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
  });
});

describe('proxy matcher', () => {
  const matches = (path: string, headers?: Record<string, string>) =>
    unstable_doesMiddlewareMatch({
      config,
      headers,
      url: `https://example.com${path}`,
    });

  it.each(['/', '/music', '/music/albums', '/music.md', '/index.md'])('runs on %s', (path) => {
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

  it.each([
    '/_next/static/chunks/app.js',
    '/api/spotify/sync',
    '/dev-console',
    '/dev-console/oauth',
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
