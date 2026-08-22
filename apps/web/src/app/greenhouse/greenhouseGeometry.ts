import type { LeafSymbol, PlantInstance } from './greenhouseLayout';

export type GreenhouseViewportName = 'desktop' | 'mobile';

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
} as const satisfies Record<GreenhouseViewportName, ViewportSize>;

export const FEATURED_PLANT_MASS_VMIN = 34;
export const REGULAR_PLANT_MASS_VMIN = 28;
export const MOBILE_PLANT_MAX_VW = 0.72;
export const PLANT_TRANSFORM_ORIGIN = { x: 0.5, y: 0.8 } as const;

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
 * 1440×900 fold from the M1 grid pass: 68rem content, 1.25rem gutter,
 * header + zeroed section, two `auto` rows.
 */
export const HOME_DESKTOP_GRID = {
  col: 534,
  gutter: 20,
  left: 176,
  row1: 404,
  row2: 269,
  top: 172,
} as const;

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

/**
 * Tight copy wells — not whole cards. Plants may occupy corners, gutters,
 * and the viewport margins around these rects.
 */
export function homeSafeRects(viewport: GreenhouseViewportName): ReadonlyArray<NamedRect> {
  if (viewport === 'desktop') {
    const { col, gutter, left, row1, top } = HOME_DESKTOP_GRID;
    const nowLeft = left + col + gutter;
    const lowerTop = top + row1 + gutter;
    return [
      { height: 320, id: 'intro-copy', width: 318, x: left + 22, y: top + 24 },
      { height: 150, id: 'now-playing-copy', width: 300, x: nowLeft + 18, y: top + 14 },
      { height: 50, id: 'activity-stats', width: 228, x: left + 10, y: lowerTop + 8 },
      { height: 220, id: 'featured-copy', width: 390, x: nowLeft + 16, y: lowerTop + 12 },
    ];
  }

  return [
    { height: 240, id: 'intro-copy', width: 250, x: 16, y: 260 },
    { height: 118, id: 'now-playing-copy', width: 268, x: 16, y: 700 },
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
