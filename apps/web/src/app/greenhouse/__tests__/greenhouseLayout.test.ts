import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
  });

  it('stays within the overlay cap', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.filter((plant) => plant.layer === 'front').length).toBeLessThanOrEqual(24);
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

    expect(featuredOf('home')).not.toBe(featuredOf('/music'));
    expect(featuredOf('home')).not.toBe(featuredOf('/music/albums'));
  });
});
