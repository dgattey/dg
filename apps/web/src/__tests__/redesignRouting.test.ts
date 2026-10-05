import { mockEnv } from '@dg/testing/mocks';
import {
  publicPathFromRedesign,
  redesignRewritePath,
  shouldSkipRedesignRewrite,
} from '../redesignRouting';

describe('redesignRouting', () => {
  it.each([
    ['/', '/redesign'],
    ['/music', '/redesign/music'],
  ])('maps %s onto %s', (pathname, expected) => {
    expect(redesignRewritePath(pathname)).toBe(expected);
    expect(publicPathFromRedesign(expected)).toBe(pathname);
  });

  it.each(['/api/status', '/.well-known/api-catalog', '/llms.txt', '/opengraph-image'])(
    'does not rewrite handlers at %s',
    (pathname) => {
      expect(shouldSkipRedesignRewrite(pathname)).toBe(true);
    },
  );

  it.each(['/wp-login.php', '/.env', '/music/sitemap.json', '/assets/app.js'])(
    'does not rewrite file-like path %s',
    (pathname) => {
      expect(shouldSkipRedesignRewrite(pathname)).toBe(true);
    },
  );

  it('does not rewrite Vercel observability scripts or beacons', () => {
    mockEnv({ NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH: '/1895a86cd22d73ea' });

    expect(shouldSkipRedesignRewrite('/1895a86cd22d73ea/insights/view')).toBe(true);
    expect(shouldSkipRedesignRewrite('/1895a86cd22d73ea/speed-insights/vitals')).toBe(true);
    expect(shouldSkipRedesignRewrite('/1895a86cd22d73ea-music')).toBe(false);
  });

  it('leaves ordinary public paths eligible', () => {
    expect(publicPathFromRedesign('/music')).toBeNull();
    expect(shouldSkipRedesignRewrite('/music')).toBe(false);
  });
});
