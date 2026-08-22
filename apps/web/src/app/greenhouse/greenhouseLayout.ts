export const LEAF_SYMBOLS = ['leaf-calathea', 'leaf-nerve', 'leaf-bop', 'leaf-monstera'] as const;

export type LeafSymbol = (typeof LEAF_SYMBOLS)[number];

export type GreenhouseSurface = 'home' | '/music' | '/music/albums';

export type PlantCluster = 'corner' | 'side' | 'vine';

export type PlantLayer = 'back' | 'front';

export type PlantEdge = 'left' | 'right' | 'bottom';

export type PlantInstance = {
  id: string;
  symbol: LeafSymbol;
  /** Inset from `edge`. Negative hangs the sprite off-canvas. */
  x: number;
  y: number;
  rotate: number;
  scale: number;
  layer: PlantLayer;
  cluster: PlantCluster;
  featured: boolean;
  edge: PlantEdge;
  /** Mirror the cutout so repeats do not look stamped. */
  flip?: boolean;
};

type PlantSpec = Omit<PlantInstance, 'id'>;

/**
 * Authored corner clusters. Plants hang in the viewport margins and only
 * overlap card corners. Safe zones: intro `h1` (upper-left of the intro cell)
 * and the now-playing title (upper-left of that cell).
 */
const COMPOSITIONS: Record<GreenhouseSurface, ReadonlyArray<PlantSpec>> = {
  '/music': [
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: -14,
      scale: 1.15,
      symbol: 'leaf-bop',
      x: -16,
      y: 8,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: true,
      layer: 'front',
      rotate: 10,
      scale: 1.2,
      symbol: 'leaf-bop',
      x: -10,
      y: 18,
    },
    {
      cluster: 'corner',
      edge: 'bottom',
      featured: false,
      layer: 'front',
      rotate: -6,
      scale: 1.05,
      symbol: 'leaf-calathea',
      x: 8,
      y: -8,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 8,
      scale: 0.9,
      symbol: 'leaf-nerve',
      x: -6,
      y: 62,
    },
  ],
  '/music/albums': [
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 12,
      scale: 1.1,
      symbol: 'leaf-monstera',
      x: -16,
      y: 12,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: true,
      layer: 'front',
      rotate: -12,
      scale: 1.15,
      symbol: 'leaf-calathea',
      x: -10,
      y: 52,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 16,
      scale: 0.95,
      symbol: 'leaf-nerve',
      x: -8,
      y: 64,
    },
    {
      cluster: 'vine',
      edge: 'bottom',
      featured: false,
      layer: 'front',
      rotate: -8,
      scale: 1.05,
      symbol: 'leaf-bop',
      x: -4,
      y: -10,
    },
  ],
  home: [
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -18,
      scale: 1.24,
      symbol: 'leaf-bop',
      x: -7,
      y: 34,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      flip: true,
      layer: 'front',
      rotate: 16,
      scale: 1.1,
      symbol: 'leaf-calathea',
      x: -5,
      y: 48,
    },
    {
      cluster: 'side',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -10,
      scale: 1.16,
      symbol: 'leaf-monstera',
      x: -8,
      y: 62,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: true,
      layer: 'front',
      rotate: 10,
      scale: 1.26,
      symbol: 'leaf-monstera',
      x: -16,
      y: 14,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      flip: true,
      layer: 'front',
      rotate: -14,
      scale: 1.04,
      symbol: 'leaf-calathea',
      x: -8,
      y: 40,
    },
    {
      cluster: 'corner',
      edge: 'bottom',
      featured: false,
      layer: 'front',
      rotate: -8,
      scale: 1.08,
      symbol: 'leaf-bop',
      x: -2,
      y: 1,
    },
    {
      cluster: 'vine',
      edge: 'bottom',
      featured: false,
      flip: true,
      layer: 'front',
      rotate: 8,
      scale: 1.06,
      symbol: 'leaf-calathea',
      x: 16,
      y: 2,
    },
    {
      cluster: 'vine',
      edge: 'bottom',
      featured: false,
      layer: 'front',
      rotate: -6,
      scale: 0.94,
      symbol: 'leaf-nerve',
      x: 40,
      y: 1,
    },
    {
      cluster: 'vine',
      edge: 'bottom',
      featured: false,
      flip: true,
      layer: 'front',
      rotate: 12,
      scale: 0.88,
      symbol: 'leaf-monstera',
      x: 78,
      y: 0,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 18,
      scale: 0.88,
      symbol: 'leaf-nerve',
      x: -3,
      y: 68,
    },
  ],
};

/**
 * Deterministic plant placement for a greenhouse surface. Same input always
 * yields the same plants. Layouts differ across surfaces so a later camera pan
 * can show a different corner of the same vocabulary.
 */
export function layoutGreenhousePlants(
  surface: GreenhouseSurface,
  contentHint = 0,
): ReadonlyArray<PlantInstance> {
  const nudge = (contentHint % 5) - 2;
  return COMPOSITIONS[surface].map((plant, index) => ({
    ...plant,
    id: `${surface}-${plant.symbol}-${plant.layer}-${index}`,
    scale: Math.min(plant.scale, 1.3),
    y: plant.y + (plant.layer === 'back' ? nudge * 0.4 : 0),
  }));
}
