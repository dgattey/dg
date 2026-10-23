import { ROUTE_MAP_TOKENS } from '../routeMapTokens';

describe('ROUTE_MAP_TOKENS', () => {
  it('cases light routes in cream and dark routes in a dark edge that cannot glow', () => {
    expect(ROUTE_MAP_TOKENS.light.casingStroke).toBe('var(--cream)');
    expect(ROUTE_MAP_TOKENS.dark.casingStroke).not.toContain('--cream');
  });

  it('keeps the basemap free of a tinted wash', () => {
    for (const { scrimGradient, tileFilter } of Object.values(ROUTE_MAP_TOKENS)) {
      expect(scrimGradient).not.toContain('--olive');
      expect(tileFilter).not.toMatch(/sepia|brightness/);
    }
  });
});
