import { homeDocumentWells, homeScrollStops, wellInViewport } from './greenhouseHomeWells';
import type { GreenhouseSurface, LeafSymbol, PlantInstance } from './greenhouseLayout';
import { plantsVisibleAt } from './greenhouseLayout';
import {
  MUSIC_LIVE_VIEWS,
  musicDocumentWells,
  musicLiveWells,
  musicScrollStops,
} from './greenhouseMusicWells';

export type GreenhouseViewportName =
  | 'phone360'
  | 'mobile'
  | 'tablet768'
  | 'tablet'
  | 'desktop'
  | 'desktop1920'
  | 'ultrawide';

export type ViewportSize = {
  height: number;
  width: number;
};

export type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type NamedRect = Rect & {
  id: string;
};

export const GREENHOUSE_VIEWPORTS = {
  desktop: { height: 900, width: 1440 },
  desktop1920: { height: 1080, width: 1920 },
  mobile: { height: 844, width: 390 },
  phone360: { height: 800, width: 360 },
  tablet: { height: 1366, width: 1024 },
  tablet768: { height: 1024, width: 768 },
  ultrawide: { height: 1440, width: 2560 },
} as const satisfies Record<GreenhouseViewportName, ViewportSize>;

/** Viewports the foliage safe-zone test must cover. */
export const FOLIAGE_SAFE_VIEWPORTS = [
  GREENHOUSE_VIEWPORTS.phone360,
  GREENHOUSE_VIEWPORTS.mobile,
  GREENHOUSE_VIEWPORTS.tablet768,
  GREENHOUSE_VIEWPORTS.tablet,
  GREENHOUSE_VIEWPORTS.desktop,
  GREENHOUSE_VIEWPORTS.desktop1920,
  GREENHOUSE_VIEWPORTS.ultrawide,
] as const;

export const FEATURED_PLANT_MASS_VMIN = 34;
export const REGULAR_PLANT_MASS_VMIN = 28;
export const MOBILE_PLANT_MAX_VW = 0.72;
export const PLANT_TRANSFORM_ORIGIN = { x: 0.5, y: 0.8 } as const;
export const FOLIAGE_ALPHA_THRESHOLD = 24;
/** Alpha > 0.5. Used when measuring whether foliage covers copy. */
export const FOLIAGE_OPAQUE_THRESHOLD = 128;
/**
 * How far an opaque leaf may sit inside a copy well before the test fails.
 * Wells already sit inset from card chrome; 8px is a tip graze, not a title.
 */
export const ALLOWED_FOLIAGE_COPY_OVERLAP_PX = 8;
/** How far plants may overlap a card edge. Copy wells stay inside this. */
export const FOLIAGE_CARD_OVERLAP = 24;
export const CONTENT_MAX_PX = 68 * 16;
export const EDGE_STRIP_MIN = 180;
export const EDGE_STRIP_VW = 0.2;
export const EDGE_STRIP_MAX = 440;
export const EDGE_STRIP_MOBILE_MIN = 16;
export const EDGE_STRIP_MOBILE_MAX = 16;
export const MOBILE_CONTENT_PAD = 16;
export const SM_BREAKPOINT = 576;
/** Dense bottom mass target on a 900px-tall desktop. Tips may rise higher. */
export const DENSE_FOLIAGE_DESKTOP_MIN = 63;
export const DENSE_FOLIAGE_DESKTOP_MAX = 81;
export const DENSE_FOLIAGE_MOBILE_MAX = 59;

/**
 * Single glass nav bar (`GreenhouseHeader`). MUI `Container fixed` +
 * `paddingBlockStart` 12 / bar `py` 8. Mobile wraps links onto a second row.
 */
export const HEADER_BAR_SAFE = {
  containerMax: 1536,
  heightDesktop: 64,
  heightMobile: 96,
  id: 'header-bar',
  inset: 16,
  topDesktop: 12,
  topMobile: 8,
} as const;

export const EDGE_STRIP_OVERLAP_DESKTOP = FOLIAGE_CARD_OVERLAP;
export const EDGE_STRIP_OVERLAP_MOBILE = 12;

export const LEAF_ASPECT: Record<LeafSymbol, number> = {
  'leaf-bop': 1024 / 1536,
  'leaf-calathea': 1024 / 683,
  'leaf-monstera': 1024 / 1536,
  'leaf-nerve': 1024 / 683,
  'leaf-pothos': 1024 / 1536,
  'leaf-prayer': 1024 / 683,
  'leaf-zz': 1024 / 1536,
};

/**
 * Opaque pixel insets of the 1024w cutouts (alpha > 24). Flip swaps left/right.
 */
export const LEAF_OPAQUE_INSET: Record<
  LeafSymbol,
  { bottom: number; left: number; right: number; top: number }
> = {
  'leaf-bop': { bottom: 0.001, left: 0.056, right: 0.174, top: 0.066 },
  'leaf-calathea': { bottom: 0, left: 0.023, right: 0.068, top: 0.176 },
  'leaf-monstera': { bottom: 0.059, left: 0.001, right: 0.045, top: 0.061 },
  'leaf-nerve': { bottom: 0.152, left: 0.084, right: 0.07, top: 0.135 },
  'leaf-pothos': { bottom: 0.045, left: 0.125, right: 0.101, top: 0.066 },
  'leaf-prayer': { bottom: 0.048, left: 0.048, right: 0.072, top: 0.085 },
  'leaf-zz': { bottom: 0.087, left: 0.018, right: 0.019, top: 0.082 },
};

/**
 * 1440×900 fold: 12 columns, content-sized rows, 1.25rem gutter.
 * Desktop (`xl` 1200+): intro `span 8` / now-playing `span 4`, then
 * activity `span 7` / featured `span 5`.
 * Below `xl`, a `span 4` now-playing is ~190–220px inside the foliage
 * inset, so intro goes `span 12` and now-playing takes the next row.
 */
export const GREENHOUSE_GRID_COLUMNS = 12;
export const GREENHOUSE_MD = 768;
export const GREENHOUSE_XL = 1200;
export const GREENHOUSE_GRID_SPANS = {
  activity: { span: 7, start: 1 },
  featured: { span: 5, start: 8 },
  intro: { span: 8, start: 1 },
  'now-playing': { span: 4, start: 9 },
} as const;
export const GREENHOUSE_STACKED_SPANS = {
  activity: { span: 7, start: 1 },
  featured: { span: 5, start: 8 },
  intro: { span: 12, start: 1 },
  'now-playing': { span: 12, start: 1 },
} as const;

export const HOME_DESKTOP_GRID = {
  gutter: 24,
  row1: 426,
  row2: 257,
  top: 172,
} as const;

/** Stacked intro + now-playing rows between `md` and `xl`. Live 1024. */
export const HOME_STACKED_GRID = {
  gutter: 24,
  intro: 374,
  now: 461,
  row3: 243,
  top: 162,
} as const;

export function isStackedHome(width: number): boolean {
  return width >= GREENHOUSE_MD && width < GREENHOUSE_XL;
}

export function gridTrackSize(contentWidth: number, gutter: number): number {
  return (contentWidth - (GREENHOUSE_GRID_COLUMNS - 1) * gutter) / GREENHOUSE_GRID_COLUMNS;
}

export function gridSpanWidth(track: number, gutter: number, span: number): number {
  return span * track + (span - 1) * gutter;
}

export function gridSpanOffset(track: number, gutter: number, start: number): number {
  return (start - 1) * (track + gutter);
}

export function plantMassVmin(plant: Pick<PlantInstance, 'featured'>): number {
  return plant.featured ? FEATURED_PLANT_MASS_VMIN : REGULAR_PLANT_MASS_VMIN;
}

/** Cap so ultrawide adds plants, not bigger ones. 1vmin at 900 CSS px. */
export const PLANT_VMIN_CAP_PX = 900;

export function plantWidthPx(plant: PlantInstance, viewport: ViewportSize): number {
  const vmin = Math.min(viewport.width, viewport.height, PLANT_VMIN_CAP_PX);
  const width = plant.scale * plantMassVmin(plant) * (vmin / 100);
  if (viewport.width <= 575) {
    return Math.min(width, viewport.width * MOBILE_PLANT_MAX_VW);
  }
  return width;
}

export function plantHeightPx(plant: PlantInstance, viewport: ViewportSize): number {
  return plantWidthPx(plant, viewport) / LEAF_ASPECT[plant.symbol];
}

/**
 * CSS box for a plant on the visual viewport. Chrome is `position: fixed`,
 * so pass the viewport size — not the document height — even on long music pages.
 */
export function plantCssBox(plant: PlantInstance, viewport: ViewportSize, scrollY = 0): Rect {
  const width = plantWidthPx(plant, viewport);
  const height = plantHeightPx(plant, viewport);
  if (plant.edge === 'bottom') {
    return {
      height,
      width,
      x: (plant.x / 100) * viewport.width,
      y: viewport.height - (plant.y / 100) * PLANT_VMIN_CAP_PX - height,
    };
  }
  const y = (plant.y / 100) * viewport.height - scrollY;
  if (plant.edge === 'right') {
    return {
      height,
      width,
      x: viewport.width - (plant.x / 100) * viewport.width - width,
      y,
    };
  }
  return {
    height,
    width,
    x: (plant.x / 100) * viewport.width,
    y,
  };
}

function rotatePoint(
  x: number,
  y: number,
  originX: number,
  originY: number,
  degrees: number,
): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = x - originX;
  const dy = y - originY;
  return { x: originX + dx * cos - dy * sin, y: originY + dx * sin + dy * cos };
}

/**
 * Axis-aligned box of the opaque cutout after CSS place + rotate.
 * `scaleX(-1)` swaps the left/right insets; origin stays 50% / 80%.
 */
export function plantOpaqueAabb(plant: PlantInstance, viewport: ViewportSize, scrollY = 0): Rect {
  const box = plantCssBox(plant, viewport, scrollY);
  const inset = LEAF_OPAQUE_INSET[plant.symbol];
  const leftInset = plant.flip ? inset.right : inset.left;
  const rightInset = plant.flip ? inset.left : inset.right;
  const left = box.x + box.width * leftInset;
  const right = box.x + box.width * (1 - rightInset);
  const top = box.y + box.height * inset.top;
  const bottom = box.y + box.height * (1 - inset.bottom);
  const originX = box.x + box.width * PLANT_TRANSFORM_ORIGIN.x;
  const originY = box.y + box.height * PLANT_TRANSFORM_ORIGIN.y;
  const corners = [
    rotatePoint(left, top, originX, originY, plant.rotate),
    rotatePoint(right, top, originX, originY, plant.rotate),
    rotatePoint(left, bottom, originX, originY, plant.rotate),
    rotatePoint(right, bottom, originX, originY, plant.rotate),
  ];
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function contentGutterWidth(width: number): number {
  if (width < SM_BREAKPOINT) {
    return MOBILE_CONTENT_PAD;
  }
  return Math.min(EDGE_STRIP_MAX, Math.max(EDGE_STRIP_MIN, width * EDGE_STRIP_VW));
}

/** Desktop `clamp(180px, 20vw, 440px)`; mobile strip is a 16px peek. */
export function edgeStripWidth(width: number): number {
  if (width < SM_BREAKPOINT) {
    return EDGE_STRIP_MOBILE_MAX;
  }
  return contentGutterWidth(width);
}

export function edgeStripOverlap(width: number): number {
  return width < SM_BREAKPOINT ? EDGE_STRIP_OVERLAP_MOBILE : EDGE_STRIP_OVERLAP_DESKTOP;
}

export function contentInset(width: number): number {
  if (width < SM_BREAKPOINT) {
    return MOBILE_CONTENT_PAD;
  }
  const centered = Math.max(24, (width - CONTENT_MAX_PX) / 2);
  return Math.max(centered, contentGutterWidth(width));
}

export function headerBarRect(viewport: ViewportSize): NamedRect {
  const mobile = viewport.width < SM_BREAKPOINT;
  const maxW = Math.min(HEADER_BAR_SAFE.containerMax, viewport.width);
  const x = (viewport.width - maxW) / 2 + HEADER_BAR_SAFE.inset;
  return {
    height: mobile ? HEADER_BAR_SAFE.heightMobile : HEADER_BAR_SAFE.heightDesktop,
    id: HEADER_BAR_SAFE.id,
    width: Math.max(120, maxW - HEADER_BAR_SAFE.inset * 2),
    x,
    y: mobile ? HEADER_BAR_SAFE.topMobile : HEADER_BAR_SAFE.topDesktop,
  };
}

export function headerControlsRect(viewport: ViewportSize): NamedRect {
  return headerBarRect(viewport);
}

export function homeGrid(viewport: ViewportSize): {
  activityW: number;
  activityX: number;
  contentW: number;
  extraTop: number;
  extraW: number;
  extraXs: ReadonlyArray<number>;
  featuredW: number;
  featuredX: number;
  gutter: number;
  introW: number;
  introX: number;
  left: number;
  nowH: number;
  nowW: number;
  nowX: number;
  row1: number;
  stacked: boolean;
  top: number;
  twoCol: boolean;
} {
  const twoCol = viewport.width >= SM_BREAKPOINT;
  const stacked = isStackedHome(viewport.width);
  const left = contentInset(viewport.width);
  const gutter = twoCol ? HOME_DESKTOP_GRID.gutter : 16;
  const contentW = viewport.width - left * 2;
  const top = stacked ? HOME_STACKED_GRID.top : twoCol ? HOME_DESKTOP_GRID.top : 96;
  const row1 = stacked ? HOME_STACKED_GRID.intro : twoCol ? HOME_DESKTOP_GRID.row1 : 280;
  const nowH = stacked ? HOME_STACKED_GRID.now : row1;
  const lowerH = stacked ? HOME_STACKED_GRID.row3 : twoCol ? HOME_DESKTOP_GRID.row2 : 220;
  const extraTop = stacked
    ? top + row1 + gutter + nowH + gutter + lowerH + gutter
    : twoCol
      ? top + row1 + gutter + lowerH + gutter
      : top + row1 + gutter + nowH + gutter + lowerH + gutter;
  if (!twoCol || stacked) {
    const track = stacked ? gridTrackSize(contentW, gutter) : 0;
    const activity = GREENHOUSE_STACKED_SPANS.activity;
    const featured = GREENHOUSE_STACKED_SPANS.featured;
    const extraW = stacked ? gridSpanWidth(track, gutter, 6) : contentW;
    const extraXs = stacked ? [left, left + extraW + gutter] : [left];
    return {
      activityW: stacked ? gridSpanWidth(track, gutter, activity.span) : contentW,
      activityX: stacked ? left + gridSpanOffset(track, gutter, activity.start) : left,
      contentW,
      extraTop,
      extraW,
      extraXs,
      featuredW: stacked ? gridSpanWidth(track, gutter, featured.span) : contentW,
      featuredX: stacked ? left + gridSpanOffset(track, gutter, featured.start) : left,
      gutter,
      introW: contentW,
      introX: left,
      left,
      nowH,
      nowW: contentW,
      nowX: left,
      row1,
      stacked,
      top,
      twoCol,
    };
  }

  const track = gridTrackSize(contentW, gutter);
  const intro = GREENHOUSE_GRID_SPANS.intro;
  const now = GREENHOUSE_GRID_SPANS['now-playing'];
  const activity = GREENHOUSE_GRID_SPANS.activity;
  const featured = GREENHOUSE_GRID_SPANS.featured;
  const extraW = gridSpanWidth(track, gutter, 4);
  return {
    activityW: gridSpanWidth(track, gutter, activity.span),
    activityX: left + gridSpanOffset(track, gutter, activity.start),
    contentW,
    extraTop,
    extraW,
    extraXs: [left, left + extraW + gutter, left + (extraW + gutter) * 2],
    featuredW: gridSpanWidth(track, gutter, featured.span),
    featuredX: left + gridSpanOffset(track, gutter, featured.start),
    gutter,
    introW: gridSpanWidth(track, gutter, intro.span),
    introX: left + gridSpanOffset(track, gutter, intro.start),
    left,
    nowH,
    nowW: gridSpanWidth(track, gutter, now.span),
    nowX: left + gridSpanOffset(track, gutter, now.start),
    row1,
    stacked,
    top,
    twoCol,
  };
}

/**
 * Tight copy wells — not whole cards. Plants may occupy corners, gutters,
 * and the viewport margins around these rects.
 */
function homeExtraCopyRects(
  viewport: ViewportSize,
  grid: ReturnType<typeof homeGrid>,
): Array<NamedRect> {
  if (grid.extraTop >= viewport.height - DENSE_FOLIAGE_DESKTOP_MAX - 12) {
    return [];
  }
  const gutter = contentGutterWidth(viewport.width);
  const overlap = edgeStripOverlap(viewport.width);
  const leftClear = gutter + overlap + 8;
  const rightClear = viewport.width - gutter - overlap - 8;
  return grid.extraXs.map((x, index) => {
    const copyX = Math.max(x + 14, leftClear);
    return {
      height: 72,
      id: `extra-${index}`,
      width: Math.max(80, Math.min(grid.extraW - 28, rightClear - copyX)),
      x: copyX,
      y: grid.extraTop + 12,
    };
  });
}

/**
 * Tight copy wells — not whole cards. Plants may occupy corners, gutters,
 * and the viewport margins around these rects. Extra project / map / side
 * cards (span 4 on xl, span 6 on md) are only protected when they sit in
 * the first viewport.
 */
export function homeSafeRectsForSize(size: ViewportSize): ReadonlyArray<NamedRect> {
  const grid = homeGrid(size);
  const strip = contentGutterWidth(size.width);
  const nowTop = grid.stacked || !grid.twoCol ? grid.top + grid.row1 + grid.gutter : grid.top;
  if (!grid.twoCol) {
    const pad = grid.left;
    const overlap = edgeStripOverlap(size.width);
    const leftClear = pad + overlap + 8;
    const rightClear = size.width - pad - overlap - 8;
    const copyWidth = Math.max(80, rightClear - leftClear);
    return [
      {
        height: 180,
        id: 'intro-copy',
        width: Math.min(200, copyWidth),
        x: leftClear,
        y: grid.top + 16,
      },
      {
        height: 72,
        id: 'now-playing-copy',
        width: Math.min(268, copyWidth),
        x: leftClear,
        y: nowTop + 16,
      },
      headerBarRect(size),
    ];
  }

  const lowerTop = grid.stacked
    ? nowTop + grid.nowH + grid.gutter
    : grid.top + grid.row1 + grid.gutter;
  const introCopyX = grid.introX + 20;
  const introCopyW = Math.min(grid.introW - 40, 40 * 11.1);
  const nowCopyX = grid.nowX + 14;
  const featuredCopyX = grid.featuredX + 16;
  const rightClear = size.width - strip - edgeStripOverlap(size.width) - 8;
  const nowCopyY = grid.stacked ? nowTop + 18 : nowTop + Math.min(grid.nowH, grid.nowW * 1.6) - 102;
  return [
    {
      height: grid.stacked ? 180 : 200,
      id: 'intro-copy',
      width: Math.max(160, introCopyW),
      x: introCopyX,
      y: grid.top + 14,
    },
    {
      height: 88,
      id: 'now-playing-copy',
      width: Math.max(80, Math.min(grid.nowW - 28, rightClear - nowCopyX)),
      x: nowCopyX,
      y: nowCopyY,
    },
    {
      height: 50,
      id: 'activity-stats',
      width: Math.min(228, grid.activityW - 24),
      x: Math.max(grid.activityX + 10, strip + 8),
      y: lowerTop + 8,
    },
    {
      height: 168,
      id: 'featured-copy',
      width: Math.max(120, Math.min(grid.featuredW - 32, rightClear - featuredCopyX)),
      x: featuredCopyX,
      y: lowerTop + 12,
    },
    ...homeExtraCopyRects(size, grid),
    headerBarRect(size),
  ];
}

export function homeSafeRects(viewport: GreenhouseViewportName): ReadonlyArray<NamedRect> {
  return homeSafeRectsForSize(GREENHOUSE_VIEWPORTS[viewport]);
}

/**
 * Live-DOM copy wells: every `[data-greenhouse-cell]` plus the page
 * heading and On repeat eyebrow. Snapshots live in `greenhouseMusicWells`.
 */
export function musicCopyRects(viewport: ViewportSize): Array<NamedRect> {
  return [...musicLiveWells(viewport)];
}

/**
 * Safe wells for a surface at a named viewport.
 */
export function surfaceSafeRects(
  surface: GreenhouseSurface,
  viewport: GreenhouseViewportName,
): ReadonlyArray<NamedRect> {
  return surfaceSafeRectsForSize(surface, GREENHOUSE_VIEWPORTS[viewport]);
}

export function surfaceSafeRectsForSize(
  surface: GreenhouseSurface,
  size: ViewportSize,
): ReadonlyArray<NamedRect> {
  if (surface === 'music') {
    return [...musicCopyRects(size)];
  }
  return homeDocumentWells(size).flatMap((well) => {
    const visible = wellInViewport(well, 0, size.height);
    return visible ? [visible] : [];
  });
}

export function plantSafeZoneHits(
  plants: ReadonlyArray<PlantInstance>,
  viewport: GreenhouseViewportName,
  surface: GreenhouseSurface = 'home',
): ReadonlyArray<{ plantId: string; rectId: string }> {
  return plantSafeZoneHitsForSize(plants, GREENHOUSE_VIEWPORTS[viewport], surface);
}

export function plantSafeZoneHitsForSize(
  plants: ReadonlyArray<PlantInstance>,
  size: ViewportSize,
  surface: GreenhouseSurface = 'home',
): ReadonlyArray<{ plantId: string; rectId: string; scrollY?: number }> {
  const visible = plantsVisibleAt(plants, size.width);
  const hits: Array<{ plantId: string; rectId: string; scrollY?: number }> = [];
  const overlap = FOLIAGE_CARD_OVERLAP;
  const sweeps =
    surface === 'music'
      ? MUSIC_LIVE_VIEWS.map((view) => ({
          stops: musicScrollStops(size, view),
          wells: musicDocumentWells(size, view),
        }))
      : [{ stops: homeScrollStops(size), wells: homeDocumentWells(size) }];
  for (const sweep of sweeps) {
    for (const scrollY of sweep.stops) {
      const safes = sweep.wells.flatMap((well) => {
        const visibleWell = wellInViewport(well, scrollY, size.height);
        return visibleWell ? [insetRect(visibleWell, overlap)] : [];
      });
      for (const plant of visible) {
        const aabb = plantOpaqueAabb(plant, size, scrollY);
        for (const safe of safes) {
          if (safe.id === 'header-bar' && plant.edge !== 'bottom') {
            continue;
          }
          if (safe.width > 0 && safe.height > 0 && rectsIntersect(aabb, safe)) {
            hits.push({ plantId: plant.id, rectId: safe.id, scrollY });
          }
        }
      }
    }
  }
  return hits;
}

export function insetRect<T extends Rect>(rect: T, inset: number): T {
  return {
    ...rect,
    height: Math.max(0, rect.height - inset * 2),
    width: Math.max(0, rect.width - inset * 2),
    x: rect.x + inset,
    y: rect.y + inset,
  };
}

export type FoliageHit = { layer: string; rectId: string; x: number; y: number };

export type PlantAlpha = {
  alpha: Uint8Array | Buffer;
  height: number;
  width: number;
};

function sampleAlpha(image: PlantAlpha, mapped: { x: number; y: number }): number {
  const px = Math.min(image.width - 1, Math.max(0, Math.round(mapped.x)));
  const py = Math.min(image.height - 1, Math.max(0, Math.round(mapped.y)));
  return image.alpha[py * image.width + px] ?? 0;
}

/**
 * Inverse of the CSS place + rotate + flip, so a viewport sample can read
 * the keyed cutout's alpha.
 */
export function viewportToPlant(
  vx: number,
  vy: number,
  plant: PlantInstance,
  viewport: ViewportSize,
  image: ViewportSize,
  scrollY = 0,
): { x: number; y: number } | null {
  const box = plantCssBox(plant, viewport, scrollY);
  const originX = box.x + box.width * PLANT_TRANSFORM_ORIGIN.x;
  const originY = box.y + box.height * PLANT_TRANSFORM_ORIGIN.y;
  const local = rotatePoint(vx, vy, originX, originY, -plant.rotate);
  if (
    local.x < box.x ||
    local.x >= box.x + box.width ||
    local.y < box.y ||
    local.y >= box.y + box.height
  ) {
    return null;
  }
  let u = (local.x - box.x) / box.width;
  const v = (local.y - box.y) / box.height;
  if (plant.flip) {
    u = 1 - u;
  }
  return { x: u * image.width, y: v * image.height };
}

function plantAlphaAt(
  vx: number,
  vy: number,
  plant: PlantInstance,
  viewport: ViewportSize,
  images: Partial<Record<LeafSymbol, PlantAlpha>>,
  scrollY = 0,
): number {
  const image = images[plant.symbol];
  if (!image) {
    return 0;
  }
  const mapped = viewportToPlant(vx, vy, plant, viewport, image, scrollY);
  return mapped ? sampleAlpha(image, mapped) : 0;
}

/**
 * Opaque foliage (alpha > 0.5) that sits more than `allowed` px inside a
 * copy well. A tip grazing the well edge is allowed; covering a title is not.
 */
export function plantOpaqueCopyHits(
  plants: ReadonlyArray<PlantInstance>,
  size: ViewportSize,
  images: Partial<Record<LeafSymbol, PlantAlpha>>,
  surface: GreenhouseSurface = 'home',
  allowed = ALLOWED_FOLIAGE_COPY_OVERLAP_PX,
): ReadonlyArray<FoliageHit> {
  const visible = plantsVisibleAt(plants, size.width);
  const hits: Array<FoliageHit> = [];
  const stride = 4;
  const inset = Math.max(allowed, FOLIAGE_CARD_OVERLAP);
  const sweeps =
    surface === 'music'
      ? MUSIC_LIVE_VIEWS.map((view) => ({
          stops: musicScrollStops(size, view),
          wells: musicDocumentWells(size, view),
        }))
      : [{ stops: homeScrollStops(size), wells: homeDocumentWells(size) }];
  for (const sweep of sweeps) {
    for (const scrollY of sweep.stops) {
      const wells = sweep.wells.flatMap((well) => {
        const visibleWell = wellInViewport(well, scrollY, size.height);
        return visibleWell ? [visibleWell] : [];
      });
      for (const well of wells) {
        const inner = insetRect(well, inset);
        if (inner.width <= 0 || inner.height <= 0) {
          continue;
        }
        const maxX = Math.floor(inner.x + inner.width);
        const maxY = Math.floor(inner.y + inner.height);
        found: for (let vy = Math.floor(inner.y); vy < maxY; vy += stride) {
          for (let vx = Math.floor(inner.x); vx < maxX; vx += stride) {
            for (const plant of visible) {
              if (well.id === 'header-bar' && plant.edge !== 'bottom') {
                continue;
              }
              if (plantAlphaAt(vx, vy, plant, size, images, scrollY) > FOLIAGE_OPAQUE_THRESHOLD) {
                hits.push({ layer: plant.id, rectId: well.id, x: vx, y: vy });
                break found;
              }
            }
          }
        }
      }
    }
  }
  return hits;
}
