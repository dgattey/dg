import { getRouteMapTokens } from '../routeMapTokens';

describe('getRouteMapTokens', () => {
  it('cases routes in cream over a cream placeholder in both schemes', () => {
    for (const dark of [false, true]) {
      expect(getRouteMapTokens(dark)).toMatchObject({
        casingStroke: 'var(--cream)',
        containerBackground: 'var(--cream)',
      });
    }
  });

  it('keeps the basemap free of a tinted wash', () => {
    for (const dark of [false, true]) {
      const { scrimGradient, tileFilter } = getRouteMapTokens(dark);
      expect(scrimGradient).not.toContain('--olive');
      expect(tileFilter).not.toMatch(/sepia|brightness/);
    }
  });
});
