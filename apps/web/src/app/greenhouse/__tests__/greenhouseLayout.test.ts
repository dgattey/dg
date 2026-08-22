import { homeSafeRects, plantSafeZoneHits } from '../greenhouseGeometry';
import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
    expect(layoutGreenhousePlants('home', 0, 'mobile')).toEqual(
      layoutGreenhousePlants('home', 0, 'mobile'),
    );
  });

  it('stacks 14–20 desktop home cutouts along the sides and bottom', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.length).toBeGreaterThanOrEqual(14);
    expect(plants.length).toBeLessThanOrEqual(20);
    const counts = Object.fromEntries(LEAF_SYMBOLS.map((symbol) => [symbol, 0])) as Record<
      (typeof LEAF_SYMBOLS)[number],
      number
    >;
    for (const plant of plants) {
      counts[plant.symbol] += 1;
    }
    expect(counts['leaf-bop']).toBeGreaterThanOrEqual(3);
    expect(counts['leaf-calathea']).toBeGreaterThanOrEqual(3);
    expect(counts['leaf-monstera']).toBeGreaterThanOrEqual(3);
    expect(counts['leaf-nerve']).toBeGreaterThanOrEqual(3);
    expect(counts['leaf-bop']).toBeLessThanOrEqual(5);
    expect(counts['leaf-calathea']).toBeLessThanOrEqual(5);
    expect(counts['leaf-monstera']).toBeLessThanOrEqual(5);
    expect(counts['leaf-nerve']).toBeLessThanOrEqual(5);
    expect(plants.some((plant) => plant.flip)).toBe(true);
    expect(plants.some((plant) => plant.layer === 'back')).toBe(true);
    expect(plants.some((plant) => plant.layer === 'front')).toBe(true);

    const symbolsOn = (edge: 'left' | 'right' | 'bottom') =>
      plants.filter((plant) => plant.edge === edge).map((plant) => plant.symbol);
    expect(symbolsOn('left')).toEqual(
      expect.arrayContaining(['leaf-bop', 'leaf-calathea', 'leaf-monstera']),
    );
    expect(symbolsOn('right')).toEqual(expect.arrayContaining(['leaf-monstera', 'leaf-calathea']));
    expect(symbolsOn('bottom')).toEqual(
      expect.arrayContaining(['leaf-calathea', 'leaf-nerve', 'leaf-monstera']),
    );
    expect(plants.filter((plant) => plant.edge === 'left').every((plant) => plant.x <= 0)).toBe(
      true,
    );
    expect(plants.filter((plant) => plant.edge === 'right').every((plant) => plant.x <= 0)).toBe(
      true,
    );
    expect(plants.filter((plant) => plant.edge === 'bottom').every((plant) => plant.y < 0)).toBe(
      true,
    );
  });

  it('keeps the mobile home thicket to 8–10 plants on the top-right and bottom', () => {
    const plants = layoutGreenhousePlants('home', 0, 'mobile');
    expect(plants.length).toBeGreaterThanOrEqual(8);
    expect(plants.length).toBeLessThanOrEqual(10);
    expect(plants.every((plant) => plant.edge === 'right' || plant.edge === 'bottom')).toBe(true);
    expect(plants.some((plant) => plant.edge === 'right')).toBe(true);
    expect(plants.some((plant) => plant.edge === 'bottom')).toBe(true);
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
    const plants = [
      ...layoutGreenhousePlants('home'),
      ...layoutGreenhousePlants('home', 0, 'mobile'),
    ];
    for (const plant of plants) {
      expect(plant.scale).toBeGreaterThanOrEqual(0.7);
      expect(plant.scale).toBeLessThanOrEqual(1.4);
    }
  });
});

describe('greenhouse safe zones', () => {
  it('defines copy wells for intro, now-playing, activity, and featured on desktop', () => {
    const ids = homeSafeRects('desktop').map((rect) => rect.id);
    expect(ids).toEqual(['intro-copy', 'now-playing-copy', 'activity-stats', 'featured-copy']);
  });

  it('keeps every desktop plant AABB out of the copy wells', () => {
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'desktop'), 'desktop')).toEqual([]);
  });

  it('keeps every mobile plant AABB out of the name column and now-playing title', () => {
    const ids = homeSafeRects('mobile').map((rect) => rect.id);
    expect(ids).toEqual(['intro-copy', 'now-playing-copy']);
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'mobile'), 'mobile')).toEqual([]);
  });
});
