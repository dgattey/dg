import { getRouteMapTokens } from '../routeMapTokens';

describe('getRouteMapTokens', () => {
  it('keeps collage cream-on-olive in both schemes', () => {
    for (const dark of [false, true]) {
      expect(getRouteMapTokens('collage', dark)).toMatchObject({
        containerBackground: 'var(--olive)',
        routeStroke: 'var(--cream)',
      });
    }
  });
});
