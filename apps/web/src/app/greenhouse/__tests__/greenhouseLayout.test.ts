import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
  });

  it('stacks repeats of each home cutout along the sides and bottom', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.length).toBeGreaterThanOrEqual(8);
    const counts = Object.fromEntries(LEAF_SYMBOLS.map((symbol) => [symbol, 0])) as Record<
      (typeof LEAF_SYMBOLS)[number],
      number
    >;
    for (const plant of plants) {
      counts[plant.symbol] += 1;
    }
    expect(counts['leaf-bop']).toBeGreaterThanOrEqual(2);
    expect(counts['leaf-calathea']).toBeGreaterThanOrEqual(2);
    expect(counts['leaf-monstera']).toBeGreaterThanOrEqual(2);
    expect(counts['leaf-nerve']).toBeGreaterThanOrEqual(2);
    expect(plants.some((plant) => plant.flip)).toBe(true);
    expect(plants.filter((plant) => plant.layer === 'back').length).toBeLessThanOrEqual(2);
    expect(plants.filter((plant) => plant.layer === 'back').every((plant) => plant.x <= -18)).toBe(
      true,
    );
  });

  it('uses only the shared leaf vocabulary', () => {
    for (const plant of layoutGreenhousePlants('home', 8)) {
      expect(LEAF_SYMBOLS).toContain(plant.symbol);
    }
  });

  it('does not reuse one composition across surfaces', () => {
    expect(layoutGreenhousePlants('home')).not.toEqual(layoutGreenhousePlants('/music'));
    expect(layoutGreenhousePlants('/music')).not.toEqual(layoutGreenhousePlants('/music/albums'));
  });

  it('features a different species per surface', () => {
    const featuredOf = (surface: 'home' | '/music' | '/music/albums') =>
      layoutGreenhousePlants(surface).find((plant) => plant.featured)?.symbol;

    expect(featuredOf('home')).toBe('leaf-monstera');
    expect(featuredOf('/music')).toBe('leaf-bop');
    expect(featuredOf('/music/albums')).toBe('leaf-calathea');
  });

  it('hangs plants from viewport edges instead of scattering over copy', () => {
    for (const plant of layoutGreenhousePlants('home')) {
      expect(['left', 'right', 'bottom']).toContain(plant.edge);
      if (plant.edge !== 'bottom') {
        expect(plant.x).toBeLessThanOrEqual(4);
      }
    }
  });

  it('does not CSS-upscale cutouts past native 1024w', () => {
    for (const plant of layoutGreenhousePlants('home')) {
      expect(plant.scale).toBeLessThanOrEqual(1.3);
    }
  });
});
