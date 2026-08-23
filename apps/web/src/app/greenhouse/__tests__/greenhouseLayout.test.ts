import {
  CONTENT_MAX_PX,
  contentInset,
  edgeStripWidth,
  GREENHOUSE_VIEWPORTS,
  homeGrid,
  homeSafeRects,
  plantOpaqueAabb,
  plantSafeZoneHits,
  surfaceSafeRects,
} from '../greenhouseGeometry';
import { LEAF_SYMBOLS, layoutGreenhousePlants } from '../greenhouseLayout';

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
    expect(layoutGreenhousePlants('home', 0, 'mobile')).toEqual(
      layoutGreenhousePlants('home', 0, 'mobile'),
    );
  });

  it('keeps two to four desktop corner cutouts in front of the strips', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.length).toBeGreaterThanOrEqual(2);
    expect(plants.length).toBeLessThanOrEqual(4);
    expect(plants.every((plant) => plant.layer === 'front')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-monstera')).toBe(true);
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

  it('keeps two mobile corner cutouts on the top-right and bottom', () => {
    const plants = layoutGreenhousePlants('home', 0, 'mobile');
    expect(plants.length).toBeGreaterThanOrEqual(2);
    expect(plants.length).toBeLessThanOrEqual(4);
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
    expect(layoutGreenhousePlants('home')).not.toEqual(layoutGreenhousePlants('music'));
  });

  it('features a different species per surface', () => {
    const featuredOf = (surface: 'home' | 'music') =>
      layoutGreenhousePlants(surface).find((plant) => plant.featured)?.symbol;

    expect(featuredOf('home')).toBe('leaf-monstera');
    expect(featuredOf('music')).toBe('leaf-bop');
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
  it('sizes the 12-col home grid so intro is wider than now-playing', () => {
    const grid = homeGrid(GREENHOUSE_VIEWPORTS.desktop);
    expect(grid.stacked).toBe(false);
    expect(grid.introW).toBeGreaterThan(grid.nowW * 1.7);
    expect(grid.activityW).toBeGreaterThan(grid.featuredW);
    expect(grid.nowX).toBeGreaterThan(grid.introX + grid.introW);
    expect(grid.featuredX).toBeGreaterThan(grid.activityX + grid.activityW);
    expect(grid.row1).toBeGreaterThanOrEqual(360);
    expect(grid.row1).toBeLessThanOrEqual(450);
  });

  it('stacks intro and now-playing below xl so the track is at least 300px', () => {
    for (const width of [768, 834, 1024, 1180]) {
      const grid = homeGrid({ height: 1366, width });
      expect(grid.stacked).toBe(true);
      expect(grid.introW).toBe(grid.contentW);
      expect(grid.nowW).toBe(grid.contentW);
      expect(grid.nowW).toBeGreaterThanOrEqual(300);
      expect(grid.nowX).toBe(grid.introX);
    }
  });

  it('defines copy wells for intro, now-playing, activity, and featured on desktop', () => {
    const ids = homeSafeRects('desktop').map((rect) => rect.id);
    expect(ids).toEqual([
      'intro-copy',
      'now-playing-copy',
      'activity-stats',
      'featured-copy',
      'header-controls',
    ]);
    const intro = homeSafeRects('desktop').find((rect) => rect.id === 'intro-copy');
    expect(intro?.width).toBeGreaterThan(200);
  });

  it('keeps every desktop plant AABB out of the copy wells', () => {
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'desktop'), 'desktop')).toEqual([]);
  });

  it('keeps every mobile plant AABB out of the name column and now-playing title', () => {
    const ids = homeSafeRects('mobile').map((rect) => rect.id);
    expect(ids).toEqual(['intro-copy', 'now-playing-copy', 'header-controls']);
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'mobile'), 'mobile')).toEqual([]);
  });

  it('pins music chrome to the visual viewport on tall pages', () => {
    const plants = layoutGreenhousePlants('music');
    const viewport = GREENHOUSE_VIEWPORTS.desktop;
    for (const plant of plants) {
      const box = plantOpaqueAabb(plant, viewport);
      expect(box.y).toBeLessThan(viewport.height);
      expect(box.y + box.height).toBeGreaterThan(0);
    }
    for (const rect of surfaceSafeRects('music', 'desktop')) {
      expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
    }
    expect(surfaceSafeRects('music', 'desktop').map((rect) => rect.id)).toEqual([
      'header-controls',
    ]);
    expect(plantSafeZoneHits(plants, 'desktop', 'music')).toEqual([]);
    expect(plantSafeZoneHits(plants, 'mobile', 'music')).toEqual([]);
  });

  it('keeps tablet and ultrawide cutouts out of the copy wells', () => {
    const plants = layoutGreenhousePlants('home', 0, 'desktop');
    expect(plantSafeZoneHits(plants, 'tablet')).toEqual([]);
    expect(plantSafeZoneHits(plants, 'ultrawide')).toEqual([]);
  });

  it('keeps the 68rem grid clear of edge strips on ultrawide', () => {
    const inset = contentInset(2560);
    const strip = edgeStripWidth(2560);
    expect(inset).toBeGreaterThan((2560 - CONTENT_MAX_PX) / 2 - 1);
    expect(strip).toBeLessThan(inset);
  });
});
