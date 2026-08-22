import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
  });

  it('places four home plants in the corners', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants).toHaveLength(4);
    expect(plants.map((plant) => plant.symbol).sort()).toEqual([
      'leaf-bop',
      'leaf-calathea',
      'leaf-monstera',
      'leaf-nerve',
    ]);
    expect(plants.filter((plant) => plant.layer === 'front').length).toBeLessThanOrEqual(4);
    expect(plants.filter((plant) => plant.layer === 'back').length).toBeLessThanOrEqual(2);
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
