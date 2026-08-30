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

  it('leaves ordinary public paths eligible', () => {
    expect(publicPathFromRedesign('/music')).toBeNull();
    expect(shouldSkipRedesignRewrite('/music')).toBe(false);
  });
});
