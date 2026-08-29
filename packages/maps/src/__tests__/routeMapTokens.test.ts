import { getRouteMapTokens } from '../routeMapTokens';

describe('getRouteMapTokens', () => {
  it('keeps classic light and dark paper/orange tokens distinct', () => {
    const light = getRouteMapTokens('classic', false);
    const dark = getRouteMapTokens('classic', true);

    expect(light.routeStroke).toContain('light-dark');
    expect(light.casingStroke).toContain('background-paper');
    expect(dark.casingStroke).toBe('rgb(0 0 0 / 0.42)');
    expect(light.scrimGradient).not.toEqual(dark.scrimGradient);
  });

  it('returns cream-on-olive collage tokens identical for light and dark', () => {
    const light = getRouteMapTokens('collage', false);
    const dark = getRouteMapTokens('collage', true);

    expect(light).toEqual(dark);
    expect(light.routeStroke).toBe('var(--cream)');
    expect(light.containerBackground).toBe('var(--olive)');
    expect(light.scrimGradient).toContain('var(--olive)');
  });
});
