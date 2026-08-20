import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
  });

  it('stays within the overlay cap', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.filter((plant) => plant.layer === 'front').length).toBeLessThanOrEqual(14);
    expect(plants.filter((plant) => plant.layer === 'back').length).toBeLessThanOrEqual(8);
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
    expect(featuredOf('/music/albums')).toBe('leaf-pothos');
  });

  it('hangs plants from viewport edges instead of scattering over copy', () => {
    for (const plant of layoutGreenhousePlants('home')) {
      expect(['left', 'right']).toContain(plant.edge);
      expect(plant.x).toBeLessThanOrEqual(4);
    }
  });

  it('does not CSS-upscale sprites past native size', () => {
    for (const plant of layoutGreenhousePlants('home')) {
      expect(plant.scale).toBeLessThanOrEqual(1.2);
    }
  });
});
