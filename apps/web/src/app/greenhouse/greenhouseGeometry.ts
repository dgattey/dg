import type { GreenhouseSurface, LeafSymbol, PlantInstance } from './greenhouseLayout';

export type GreenhouseViewportName = 'desktop' | 'mobile' | 'tablet' | 'ultrawide';

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
  mobile: { height: 844, width: 390 },
  tablet: { height: 1366, width: 1024 },
  ultrawide: { height: 1440, width: 2560 },
} as const satisfies Record<GreenhouseViewportName, ViewportSize>;

export const FEATURED_PLANT_MASS_VMIN = 34;
export const REGULAR_PLANT_MASS_VMIN = 28;
export const MOBILE_PLANT_MAX_VW = 0.72;
export const PLANT_TRANSFORM_ORIGIN = { x: 0.5, y: 0.8 } as const;
export const FOLIAGE_ALPHA_THRESHOLD = 24;
/** Alpha > 0.5. Used when measuring whether a strip covers copy. */
export const FOLIAGE_OPAQUE_THRESHOLD = 128;
export const CONTENT_MAX_PX = 68 * 16;
export const EDGE_STRIP_MIN = 180;
export const EDGE_STRIP_VW = 0.2;
export const EDGE_STRIP_MAX = 440;
export const EDGE_STRIP_MOBILE_MIN = 16;
export const EDGE_STRIP_MOBILE_MAX = 16;
export const MOBILE_CONTENT_PAD = 16;
export const SM_BREAKPOINT = 576;
export const BOTTOM_BAND_DESKTOP_DVH = 0.15;
export const BOTTOM_BAND_DESKTOP_MAX = 150;
export const BOTTOM_BAND_MOBILE_DVH = 0.09;
export const BOTTOM_BAND_MOBILE_MAX = 84;
export const MUSIC_LEFT_STRIP_SCALE = 0.64;

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

/** Opaque width ÷ intrinsic width of the 1536 keyed strips (alpha > 24). */
export const EDGE_STRIP_OPAQUE = { left: 0.856, right: 0.721 } as const;
export const EDGE_STRIP_ASPECT = 1024 / 1536;
export const EDGE_STRIP_OVERLAP_DESKTOP = 56;
export const EDGE_STRIP_OVERLAP_MOBILE = 16;

export const LEAF_ASPECT: Record<LeafSymbol, number> = {
  'leaf-bop': 1024 / 1536,
  'leaf-calathea': 1024 / 683,
  'leaf-monstera': 1024 / 1536,
  'leaf-nerve': 1024 / 683,
};

/**
 * Opaque pixel insets of the 1024w cutouts (alpha > 24). Flip swaps left/right.
 */
export const LEAF_OPAQUE_INSET: Record<
  LeafSymbol,
  { bottom: number; left: number; right: number; top: number }
> = {
  'leaf-bop': { bottom: 0.001, left: 0.056, right: 0.175, top: 0.066 },
  'leaf-calathea': { bottom: 0.001, left: 0.023, right: 0.069, top: 0.176 },
  'leaf-monstera': { bottom: 0.059, left: 0.001, right: 0.046, top: 0.061 },
  'leaf-nerve': { bottom: 0.154, left: 0.084, right: 0.071, top: 0.135 },
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

export function plantWidthPx(plant: PlantInstance, viewport: ViewportSize): number {
  const vmin = Math.min(viewport.width, viewport.height);
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
export function plantCssBox(plant: PlantInstance, viewport: ViewportSize): Rect {
  const width = plantWidthPx(plant, viewport);
  const height = plantHeightPx(plant, viewport);
  if (plant.edge === 'bottom') {
    return {
      height,
      width,
      x: (plant.x / 100) * viewport.width,
      y: viewport.height - (plant.y / 100) * viewport.height - height,
    };
  }
  if (plant.edge === 'right') {
    return {
      height,
      width,
      x: viewport.width - (plant.x / 100) * viewport.width - width,
      y: (plant.y / 100) * viewport.height,
    };
  }
  return {
    height,
    width,
    x: (plant.x / 100) * viewport.width,
    y: (plant.y / 100) * viewport.height,
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
export function plantOpaqueAabb(plant: PlantInstance, viewport: ViewportSize): Rect {
  const box = plantCssBox(plant, viewport);
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

/** CSS img width so the opaque silhouette reaches gutter + overlap. */
export function edgeStripImgWidth(
  width: number,
  side: 'left' | 'right',
  surface: GreenhouseSurface = 'home',
): number {
  const base = (edgeStripWidth(width) + edgeStripOverlap(width)) / EDGE_STRIP_OPAQUE[side];
  if (surface === 'music' && side === 'left') {
    return base * MUSIC_LEFT_STRIP_SCALE;
  }
  return base;
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

export function edgeStripRect(
  side: 'left' | 'right',
  viewport: ViewportSize,
  surface: GreenhouseSurface = 'home',
): Rect {
  const width = edgeStripImgWidth(viewport.width, side, surface);
  const height = width / EDGE_STRIP_ASPECT;
  return {
    height,
    width,
    x: side === 'left' ? 0 : viewport.width - width,
    y: viewport.height - height,
  };
}

export function bottomBandHeight(viewport: ViewportSize): number {
  const mobile = viewport.width < SM_BREAKPOINT;
  return Math.min(
    mobile ? BOTTOM_BAND_MOBILE_MAX : BOTTOM_BAND_DESKTOP_MAX,
    viewport.height * (mobile ? BOTTOM_BAND_MOBILE_DVH : BOTTOM_BAND_DESKTOP_DVH),
  );
}

export function bottomBandRect(viewport: ViewportSize): Rect {
  const height = bottomBandHeight(viewport);
  return { height, width: viewport.width, x: 0, y: viewport.height - height };
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
  if (grid.extraTop >= viewport.height) {
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
export function homeSafeRects(viewport: GreenhouseViewportName): ReadonlyArray<NamedRect> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  const grid = homeGrid(size);
  const strip = contentGutterWidth(size.width);
  if (!grid.twoCol) {
    const pad = grid.left;
    const overlap = edgeStripOverlap(size.width);
    const leftClear = pad + overlap + 8;
    const rightClear = size.width - pad - overlap - 8;
    const copyWidth = Math.max(80, rightClear - leftClear);
    return [
      { height: 200, id: 'intro-copy', width: Math.min(200, copyWidth), x: leftClear, y: 248 },
      {
        height: 96,
        id: 'now-playing-copy',
        width: Math.min(268, copyWidth),
        x: leftClear,
        y: 720,
      },
      headerBarRect(size),
    ];
  }

  const nowTop = grid.stacked ? grid.top + grid.row1 + grid.gutter : grid.top;
  const lowerTop = grid.stacked
    ? nowTop + grid.nowH + grid.gutter
    : grid.top + grid.row1 + grid.gutter;
  const introCopyX = grid.introX + 20;
  const introCopyW = Math.min(grid.introW - 40, 40 * 11.1);
  const nowCopyX = grid.nowX + 14;
  const featuredCopyX = grid.featuredX + 16;
  const rightClear = size.width - strip - edgeStripOverlap(size.width) - 8;
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
      y: nowTop + Math.min(grid.nowH, grid.nowW * 1.6) - 102,
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

/**
 * Listening heading + On repeat eyebrow. The heading sits in the span-4
 * intro cell; body1 is `36ch`. Plants and strips must stay out of these.
 */
export function musicCopyRects(viewport: ViewportSize): Array<NamedRect> {
  const left = contentInset(viewport.width);
  const copyX = left + 8;
  if (viewport.width < SM_BREAKPOINT) {
    const width = Math.max(80, viewport.width - copyX - left);
    return [
      { height: 120, id: 'music-heading', width: Math.min(220, width), x: copyX, y: 96 },
      { height: 36, id: 'music-on-repeat', width: Math.min(180, width), x: copyX, y: 560 },
    ];
  }
  const contentW = viewport.width - left * 2;
  const introW = (contentW * 4) / 12;
  return [
    {
      height: 130,
      id: 'music-heading',
      width: Math.max(120, Math.min(36 * 10, introW - 16)),
      x: copyX,
      y: 200,
    },
    { height: 40, id: 'music-on-repeat', width: 200, x: copyX, y: 336 },
  ];
}

/**
 * Safe wells for a surface. Plants stay pinned to the visual viewport, so
 * these rects never grow with document height.
 */
export function surfaceSafeRects(
  surface: GreenhouseSurface,
  viewport: GreenhouseViewportName,
): ReadonlyArray<NamedRect> {
  if (surface === 'home') {
    return homeSafeRects(viewport);
  }
  const size = GREENHOUSE_VIEWPORTS[viewport];
  return [...musicCopyRects(size), headerBarRect(size)];
}

export function plantSafeZoneHits(
  plants: ReadonlyArray<PlantInstance>,
  viewport: GreenhouseViewportName,
  surface: GreenhouseSurface = 'home',
): ReadonlyArray<{ plantId: string; rectId: string }> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  const safes = surfaceSafeRects(surface, viewport);
  const hits: Array<{ plantId: string; rectId: string }> = [];
  for (const plant of plants) {
    const aabb = plantOpaqueAabb(plant, size);
    for (const safe of safes) {
      if (rectsIntersect(aabb, safe)) {
        hits.push({ plantId: plant.id, rectId: safe.id });
      }
    }
  }
  return hits;
}

function mapContain(
  localX: number,
  localY: number,
  box: ViewportSize,
  image: ViewportSize,
  posX: number,
  posY: number,
): { x: number; y: number } | null {
  const scale = Math.min(box.width / image.width, box.height / image.height);
  const drawnWidth = image.width * scale;
  const drawnHeight = image.height * scale;
  const offsetX = (box.width - drawnWidth) * posX;
  const offsetY = (box.height - drawnHeight) * posY;
  const x = (localX - offsetX) / scale;
  const y = (localY - offsetY) / scale;
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return null;
  }
  return { x, y };
}

export function viewportToEdgeStrip(
  vx: number,
  vy: number,
  viewport: ViewportSize,
  image: ViewportSize,
  side: 'left' | 'right',
  surface: GreenhouseSurface = 'home',
): { x: number; y: number } | null {
  const box = edgeStripRect(side, viewport, surface);
  if (vx < box.x || vx >= box.x + box.width || vy < box.y || vy >= box.y + box.height) {
    return null;
  }
  return mapContain(vx - box.x, vy - box.y, box, image, side === 'left' ? 0 : 1, 1);
}

export function viewportToBottomBand(
  vx: number,
  vy: number,
  viewport: ViewportSize,
  image: ViewportSize,
): { x: number; y: number } | null {
  const box = bottomBandRect(viewport);
  if (vx < box.x || vx >= box.x + box.width || vy < box.y || vy >= box.y + box.height) {
    return null;
  }
  const scale = box.height / image.height;
  const tileWidth = image.width * scale;
  const origin = viewport.width / 2 - tileWidth / 2;
  let relX = vx - origin;
  relX = ((relX % tileWidth) + tileWidth) % tileWidth;
  const x = relX / scale;
  const y = (vy - box.y) / scale;
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) {
    return null;
  }
  return { x, y };
}

function sampleAlpha(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  mapped: { x: number; y: number },
): number {
  const px = Math.min(image.width - 1, Math.max(0, Math.round(mapped.x)));
  const py = Math.min(image.height - 1, Math.max(0, Math.round(mapped.y)));
  return alpha[py * image.width + px] ?? 0;
}

export type FoliageHit = { layer: string; rectId: string; x: number; y: number };

function hitsInWells(
  viewport: GreenhouseViewportName,
  sample: (vx: number, vy: number) => number,
  layer: string,
  surface: GreenhouseSurface = 'home',
  threshold: number = FOLIAGE_ALPHA_THRESHOLD,
): Array<FoliageHit> {
  const hits: Array<FoliageHit> = [];
  const stride = 4;
  for (const safe of surfaceSafeRects(surface, viewport)) {
    const maxX = Math.floor(safe.x + safe.width);
    const maxY = Math.floor(safe.y + safe.height);
    found: for (let vy = Math.floor(safe.y); vy < maxY; vy += stride) {
      for (let vx = Math.floor(safe.x); vx < maxX; vx += stride) {
        if (sample(vx, vy) > threshold) {
          hits.push({ layer, rectId: safe.id, x: vx, y: vy });
          break found;
        }
      }
    }
  }
  return hits;
}

/**
 * How far a strip's opaque (alpha > 0.5) mass reaches at `y`.
 * Left returns the max x; right returns the min x. Null if none.
 */
export function edgeStripOpaqueExtent(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  side: 'left' | 'right',
  viewport: ViewportSize,
  y: number,
  surface: GreenhouseSurface = 'home',
): number | null {
  const box = edgeStripRect(side, viewport, surface);
  if (y < box.y || y >= box.y + box.height) {
    return null;
  }
  const start = Math.floor(box.x);
  const end = Math.ceil(box.x + box.width);
  if (side === 'left') {
    let maxX: number | null = null;
    for (let vx = start; vx < end; vx += 1) {
      const mapped = viewportToEdgeStrip(vx, y, viewport, image, side, surface);
      if (mapped && sampleAlpha(alpha, image, mapped) > FOLIAGE_OPAQUE_THRESHOLD) {
        maxX = vx;
      }
    }
    return maxX;
  }
  for (let vx = start; vx < end; vx += 1) {
    const mapped = viewportToEdgeStrip(vx, y, viewport, image, side, surface);
    if (mapped && sampleAlpha(alpha, image, mapped) > FOLIAGE_OPAQUE_THRESHOLD) {
      return vx;
    }
  }
  return null;
}

export function edgeStripCopyWellHits(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  side: 'left' | 'right',
  viewport: GreenhouseViewportName,
  surface: GreenhouseSurface,
): ReadonlyArray<FoliageHit> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  return hitsInWells(
    viewport,
    (vx, vy) => {
      const mapped = viewportToEdgeStrip(vx, vy, size, image, side, surface);
      return mapped ? sampleAlpha(alpha, image, mapped) : 0;
    },
    `edge-${side}`,
    surface,
    FOLIAGE_OPAQUE_THRESHOLD,
  );
}

export function edgeStripSafeZoneHits(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  side: 'left' | 'right',
  viewport: GreenhouseViewportName,
  surface: GreenhouseSurface = 'home',
): ReadonlyArray<FoliageHit> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  return hitsInWells(
    viewport,
    (vx, vy) => {
      const mapped = viewportToEdgeStrip(vx, vy, size, image, side, surface);
      return mapped ? sampleAlpha(alpha, image, mapped) : 0;
    },
    `edge-${side}`,
    surface,
  );
}

export function bottomBandSafeZoneHits(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  viewport: GreenhouseViewportName,
): ReadonlyArray<FoliageHit> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  return hitsInWells(
    viewport,
    (vx, vy) => {
      const mapped = viewportToBottomBand(vx, vy, size, image);
      return mapped ? sampleAlpha(alpha, image, mapped) : 0;
    },
    'bottom-band',
  );
}
