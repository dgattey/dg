import type { LeafSymbol, PlantInstance } from './greenhouseLayout';

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
export const CONTENT_MAX_PX = 68 * 16;
export const EDGE_STRIP_MIN = 180;
export const EDGE_STRIP_VW = 0.2;
export const EDGE_STRIP_MAX = 440;
export const EDGE_STRIP_MOBILE_MIN = 90;
export const EDGE_STRIP_MOBILE_VW = 0.14;
export const EDGE_STRIP_MOBILE_MAX = 140;
export const SM_BREAKPOINT = 576;

/** Top-right music/theme capsule. Right strip is clipped out of this well. */
export const HEADER_CONTROLS_SAFE = {
  height: 52,
  id: 'header-controls',
  insetRight: 16,
  top: 8,
  width: 132,
} as const;

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

export function contentInset(width: number): number {
  const minPad = width < SM_BREAKPOINT ? EDGE_STRIP_MOBILE_MIN : 24;
  const centered = Math.max(minPad, (width - CONTENT_MAX_PX) / 2);
  return Math.max(centered, edgeStripWidth(width));
}

/** Desktop `clamp(180px, 20vw, 440px)`; mobile `clamp(90px, 14vw, 140px)`. */
export function edgeStripWidth(width: number): number {
  if (width < SM_BREAKPOINT) {
    return Math.min(
      EDGE_STRIP_MOBILE_MAX,
      Math.max(EDGE_STRIP_MOBILE_MIN, width * EDGE_STRIP_MOBILE_VW),
    );
  }
  return Math.min(EDGE_STRIP_MAX, Math.max(EDGE_STRIP_MIN, width * EDGE_STRIP_VW));
}

export function headerControlsRect(viewport: ViewportSize): NamedRect {
  return {
    height: HEADER_CONTROLS_SAFE.height,
    id: HEADER_CONTROLS_SAFE.id,
    width: HEADER_CONTROLS_SAFE.width,
    x: viewport.width - HEADER_CONTROLS_SAFE.insetRight - HEADER_CONTROLS_SAFE.width,
    y: HEADER_CONTROLS_SAFE.top,
  };
}

export function edgeStripRect(side: 'left' | 'right', viewport: ViewportSize): Rect {
  const width = edgeStripWidth(viewport.width);
  return {
    height: viewport.height,
    width,
    x: side === 'left' ? 0 : viewport.width - width,
    y: 0,
  };
}

export function bottomBandHeight(viewport: ViewportSize): number {
  const mobile = viewport.width < SM_BREAKPOINT;
  return Math.min(mobile ? 260 : 420, viewport.height * (mobile ? 0.24 : 0.34));
}

export function bottomBandRect(viewport: ViewportSize): Rect {
  const height = bottomBandHeight(viewport);
  return { height, width: viewport.width, x: 0, y: viewport.height - height };
}

export function homeGrid(viewport: ViewportSize): {
  activityW: number;
  activityX: number;
  contentW: number;
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
  if (!twoCol || stacked) {
    const track = stacked ? gridTrackSize(contentW, gutter) : 0;
    const activity = GREENHOUSE_STACKED_SPANS.activity;
    const featured = GREENHOUSE_STACKED_SPANS.featured;
    return {
      activityW: stacked ? gridSpanWidth(track, gutter, activity.span) : contentW,
      activityX: stacked ? left + gridSpanOffset(track, gutter, activity.start) : left,
      contentW,
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
  return {
    activityW: gridSpanWidth(track, gutter, activity.span),
    activityX: left + gridSpanOffset(track, gutter, activity.start),
    contentW,
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
export function homeSafeRects(viewport: GreenhouseViewportName): ReadonlyArray<NamedRect> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  const grid = homeGrid(size);
  const strip = edgeStripWidth(size.width);
  if (!grid.twoCol) {
    const pad = Math.max(grid.left, strip);
    const copyWidth = Math.max(120, size.width - pad * 2 - 16);
    return [
      { height: 280, id: 'intro-copy', width: Math.min(280, copyWidth), x: pad + 8, y: 248 },
      { height: 96, id: 'now-playing-copy', width: Math.min(268, copyWidth), x: pad + 8, y: 720 },
      headerControlsRect(size),
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
      width: Math.max(80, Math.min(grid.nowW - 28, size.width - strip - 12 - nowCopyX)),
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
      width: Math.max(120, Math.min(grid.featuredW - 32, size.width - strip - 12 - featuredCopyX)),
      x: featuredCopyX,
      y: lowerTop + 12,
    },
    headerControlsRect(size),
  ];
}

export function plantSafeZoneHits(
  plants: ReadonlyArray<PlantInstance>,
  viewport: GreenhouseViewportName,
): ReadonlyArray<{ plantId: string; rectId: string }> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  const safes = homeSafeRects(viewport);
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

function mapCover(
  localX: number,
  localY: number,
  box: ViewportSize,
  image: ViewportSize,
  posX: number,
  posY: number,
): { x: number; y: number } | null {
  const scale = Math.max(box.width / image.width, box.height / image.height);
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
): { x: number; y: number } | null {
  const box = edgeStripRect(side, viewport);
  if (vx < box.x || vx >= box.x + box.width || vy < box.y || vy >= box.y + box.height) {
    return null;
  }
  if (
    side === 'right' &&
    rectsIntersect({ height: 1, width: 1, x: vx, y: vy }, headerControlsRect(viewport))
  ) {
    return null;
  }
  return mapCover(vx - box.x, vy - box.y, box, image, side === 'left' ? 0 : 1, 1);
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
): Array<FoliageHit> {
  const hits: Array<FoliageHit> = [];
  const stride = 4;
  for (const safe of homeSafeRects(viewport)) {
    const maxX = Math.floor(safe.x + safe.width);
    const maxY = Math.floor(safe.y + safe.height);
    found: for (let vy = Math.floor(safe.y); vy < maxY; vy += stride) {
      for (let vx = Math.floor(safe.x); vx < maxX; vx += stride) {
        if (sample(vx, vy) > FOLIAGE_ALPHA_THRESHOLD) {
          hits.push({ layer, rectId: safe.id, x: vx, y: vy });
          break found;
        }
      }
    }
  }
  return hits;
}

export function edgeStripSafeZoneHits(
  alpha: Uint8Array | Buffer,
  image: ViewportSize,
  side: 'left' | 'right',
  viewport: GreenhouseViewportName,
): ReadonlyArray<FoliageHit> {
  const size = GREENHOUSE_VIEWPORTS[viewport];
  return hitsInWells(
    viewport,
    (vx, vy) => {
      const mapped = viewportToEdgeStrip(vx, vy, size, image, side);
      return mapped ? sampleAlpha(alpha, image, mapped) : 0;
    },
    `edge-${side}`,
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
