import {
  CONTENT_MAX_PX,
  contentGutterWidth,
  contentInset,
  DENSE_FOLIAGE_DESKTOP_MAX,
  DENSE_FOLIAGE_MOBILE_MAX,
  edgeStripWidth,
  FOLIAGE_SAFE_VIEWPORTS,
  GREENHOUSE_VIEWPORTS,
  homeGrid,
  homeSafeRects,
  plantCssBox,
  plantOpaqueAabb,
  plantSafeZoneHits,
  plantSafeZoneHitsForSize,
  surfaceSafeRects,
} from '../greenhouseGeometry';
import {
  LEAF_SYMBOLS,
  layoutGreenhousePlants,
  type PlantInstance,
  plantsVisibleAt,
} from '../greenhouseLayout';
import { musicDocumentWells } from '../greenhouseMusicWells';

function bottomNeighborsShareSpecies(
  plants: ReturnType<typeof layoutGreenhousePlants>,
  width: number,
): boolean {
  const bottom = plantsVisibleAt(plants, width)
    .filter((plant) => plant.edge === 'bottom')
    .toSorted((a, b) => a.x - b.x);
  return bottom.some((plant, index) => {
    const prev = bottom[index - 1];
    return prev != null && prev.symbol === plant.symbol;
  });
}

function speciesRepeatAt(
  plants: ReturnType<typeof layoutGreenhousePlants>,
  width: number,
): boolean {
  const seen = new Set<string>();
  for (const plant of plantsVisibleAt(plants, width)) {
    if (seen.has(plant.symbol)) {
      return true;
    }
    seen.add(plant.symbol);
  }
  return false;
}

function denseBottomPx(
  plants: ReturnType<typeof layoutGreenhousePlants>,
  viewport: { height: number; width: number },
): number {
  let highest = viewport.height;
  for (const plant of plantsVisibleAt(plants, viewport.width)) {
    if (plant.edge !== 'bottom') {
      continue;
    }
    const box = plantCssBox(plant, viewport);
    highest = Math.min(highest, box.y);
  }
  return viewport.height - highest;
}

describe('greenhouseLayout', () => {
  it('is deterministic for a surface', () => {
    expect(layoutGreenhousePlants('home')).toEqual(layoutGreenhousePlants('home'));
    expect(layoutGreenhousePlants('home', 0, 'mobile')).toEqual(
      layoutGreenhousePlants('home', 0, 'mobile'),
    );
  });

  it('places a mixed bottom fringe and side peeks on desktop', () => {
    const plants = layoutGreenhousePlants('home');
    expect(plants.filter((plant) => plant.edge === 'bottom').length).toBeGreaterThanOrEqual(6);
    expect(plants.some((plant) => plant.edge === 'left')).toBe(true);
    expect(plants.some((plant) => plant.edge === 'right')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-monstera')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-bop')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-calathea')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-nerve')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-pothos')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-prayer')).toBe(true);
    expect(plants.some((plant) => plant.symbol === 'leaf-zz')).toBe(true);
  });

  it('keeps mobile foliage on the bottom and one right peek', () => {
    const plants = layoutGreenhousePlants('home', 0, 'mobile');
    expect(plants.length).toBeGreaterThanOrEqual(4);
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

  it('features a different side peek per surface', () => {
    const featuredOf = (surface: 'home' | 'music') =>
      layoutGreenhousePlants(surface).find((plant) => plant.featured);

    expect(featuredOf('home')?.symbol).toBe('leaf-bop');
    expect(featuredOf('home')?.edge).toBe('right');
    expect(featuredOf('music')?.symbol).toBe('leaf-bop');
    expect(featuredOf('music')?.edge).toBe('right');
    expect(featuredOf('home')?.id).not.toBe(featuredOf('music')?.id);
  });

  it('keeps side peeks off the plate species at that edge', () => {
    for (const surface of ['home', 'music'] as const) {
      for (const viewport of ['desktop', 'mobile'] as const) {
        const plants = layoutGreenhousePlants(surface, 0, viewport);
        for (const plant of plants) {
          if (plant.edge === 'left' || plant.edge === 'right') {
            expect(plant.layer).toBe('front');
          }
          if (plant.edge === 'left') {
            expect(plant.symbol).not.toBe('leaf-bop');
          }
          if (plant.edge === 'right') {
            expect(plant.symbol).not.toBe('leaf-monstera');
          }
        }
      }
    }
  });

  it('shows every species at 1440 and never repeats one below 1800', () => {
    for (const surface of ['home', 'music'] as const) {
      const desktop = layoutGreenhousePlants(surface);
      const at1440 = new Set(plantsVisibleAt(desktop, 1440).map((plant) => plant.symbol));
      expect([...at1440].toSorted()).toEqual([...LEAF_SYMBOLS]);
      expect(speciesRepeatAt(desktop, 1440)).toBe(false);
      expect(speciesRepeatAt(desktop, 1024)).toBe(false);
      expect(speciesRepeatAt(layoutGreenhousePlants(surface, 0, 'mobile'), 390)).toBe(false);
    }
  });

  it('keeps ultrawide repeats flipped, resized, and 600px from their twin', () => {
    for (const width of [1920, 2560]) {
      const size = { height: width === 1920 ? 1080 : 1440, width };
      for (const surface of ['home', 'music'] as const) {
        const plants = plantsVisibleAt(layoutGreenhousePlants(surface), width);
        const bySymbol = new Map<string, Array<PlantInstance>>();
        for (const plant of plants) {
          const group = bySymbol.get(plant.symbol) ?? [];
          group.push(plant);
          bySymbol.set(plant.symbol, group);
        }
        for (const group of bySymbol.values()) {
          if (group.length < 2) continue;
          for (let i = 0; i < group.length; i += 1) {
            for (let j = i + 1; j < group.length; j += 1) {
              const a = group[i];
              const b = group[j];
              if (!a || !b) {
                throw new Error(`expected a twin pair at ${i}/${j}`);
              }
              expect(Boolean(a.flip)).not.toBe(Boolean(b.flip));
              expect(a.scale).not.toBe(b.scale);
              expect(a.rotate).not.toBe(b.rotate);
              const boxA = plantCssBox(a, size);
              const boxB = plantCssBox(b, size);
              const dx = boxA.x + boxA.width / 2 - (boxB.x + boxB.width / 2);
              expect(Math.abs(dx)).toBeGreaterThanOrEqual(600);
            }
          }
        }
      }
    }
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

  it('never lets two bottom neighbors share a species', () => {
    for (const width of [360, 390, 768, 1024, 1440, 1920, 2560]) {
      const viewport = width < 576 ? 'mobile' : 'desktop';
      expect(bottomNeighborsShareSpecies(layoutGreenhousePlants('home', 0, viewport), width)).toBe(
        false,
      );
      expect(bottomNeighborsShareSpecies(layoutGreenhousePlants('music', 0, viewport), width)).toBe(
        false,
      );
    }
  });

  it('does not repeat a species within one 1440 viewport', () => {
    expect(speciesRepeatAt(layoutGreenhousePlants('home'), 1440)).toBe(false);
    expect(speciesRepeatAt(layoutGreenhousePlants('music'), 1440)).toBe(false);
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
      'header-bar',
    ]);
    const intro = homeSafeRects('desktop').find((rect) => rect.id === 'intro-copy');
    expect(intro?.width).toBeGreaterThan(200);
  });

  it('keeps every desktop plant AABB out of the copy wells', () => {
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'desktop'), 'desktop')).toEqual([]);
  });

  it('measures every home cell, the header, and the footer as copy wells', () => {
    expect(surfaceSafeRects('home', 'desktop').map((rect) => rect.id)).toEqual([
      'header-bar',
      'cell-intro',
      'cell-now-playing',
      'cell-activity',
      'cell-featured',
      'cell-more-4',
      'cell-more-5',
      'cell-more-6',
    ]);
    expect(surfaceSafeRects('home', 'mobile').map((rect) => rect.id)).toEqual([
      'header-bar',
      'cell-intro',
      'cell-now-playing',
    ]);
  });

  it('keeps every mobile plant AABB out of the name column and now-playing title', () => {
    const ids = homeSafeRects('mobile').map((rect) => rect.id);
    expect(ids).toEqual(['intro-copy', 'now-playing-copy', 'header-bar']);
    expect(plantSafeZoneHits(layoutGreenhousePlants('home', 0, 'mobile'), 'mobile')).toEqual([]);
  });

  it('pins music chrome to the visual viewport on tall pages', () => {
    const plants = layoutGreenhousePlants('music');
    const viewport = GREENHOUSE_VIEWPORTS.desktop;
    for (const plant of plantsVisibleAt(plants, viewport.width)) {
      const box = plantOpaqueAabb(plant, viewport);
      // Fixed fringe may hang off the bottom; it must not live in document space.
      expect(box.y + box.height).toBeGreaterThan(viewport.height * 0.7);
      expect(box.y).toBeLessThan(viewport.height + 80);
    }
    for (const rect of surfaceSafeRects('music', 'desktop')) {
      expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
    }
    expect(surfaceSafeRects('music', 'desktop').map((rect) => rect.id)).toEqual([
      'header-bar',
      'cell-intro',
      'cell-now-playing',
      'cell-albums',
      'cell-on-repeat',
      'cell-history',
    ]);
    expect(musicDocumentWells(viewport, 'listening').map((rect) => rect.id)).toEqual([
      'header-bar',
      'cell-intro',
      'cell-now-playing',
      'cell-albums',
      'cell-on-repeat',
      'cell-history',
      'cell-tracks',
      'cell-artists',
      'footer',
    ]);
    expect(musicDocumentWells(viewport, 'albums').map((rect) => rect.id)).toEqual([
      'header-bar',
      'cell-albums-heading',
      'cell-albums-grid',
      'footer',
    ]);
    expect(plantSafeZoneHits(plants, 'desktop', 'music')).toEqual([]);
    expect(
      plantSafeZoneHits(layoutGreenhousePlants('music', 0, 'mobile'), 'mobile', 'music'),
    ).toEqual([]);
  });

  it('keeps cutouts out of copy wells at every foliage viewport', () => {
    for (const size of FOLIAGE_SAFE_VIEWPORTS) {
      const viewport = size.width < 576 ? 'mobile' : 'desktop';
      expect(plantSafeZoneHitsForSize(layoutGreenhousePlants('home', 0, viewport), size)).toEqual(
        [],
      );
      expect(
        plantSafeZoneHitsForSize(layoutGreenhousePlants('music', 0, viewport), size, 'music'),
      ).toEqual([]);
    }
  });

  it('keeps the 68rem grid clear of the side gutter on ultrawide', () => {
    const inset = contentInset(2560);
    const strip = edgeStripWidth(2560);
    expect(inset).toBeGreaterThan((2560 - CONTENT_MAX_PX) / 2 - 1);
    expect(strip).toBeLessThan(inset);
  });

  it('keeps the bottom fringe a peek, not a wall', () => {
    const desktop = denseBottomPx(
      layoutGreenhousePlants('home', 0, 'desktop'),
      GREENHOUSE_VIEWPORTS.desktop,
    );
    const mobile = denseBottomPx(
      layoutGreenhousePlants('home', 0, 'mobile'),
      GREENHOUSE_VIEWPORTS.mobile,
    );
    expect(desktop).toBeLessThanOrEqual(DENSE_FOLIAGE_DESKTOP_MAX + 160);
    expect(mobile).toBeLessThanOrEqual(DENSE_FOLIAGE_MOBILE_MAX + 140);
    expect(contentGutterWidth(1440)).toBeGreaterThan(100);
  });
});
