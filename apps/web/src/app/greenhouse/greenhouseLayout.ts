export const LEAF_SYMBOLS = [
  'leaf-zz',
  'leaf-pothos',
  'leaf-calathea',
  'leaf-prayer',
  'leaf-nerve',
  'leaf-bop',
  'leaf-monstera',
] as const;

export type LeafSymbol = (typeof LEAF_SYMBOLS)[number];

export type GreenhouseSurface = 'home' | '/music' | '/music/albums';

export type PlantCluster = 'corner' | 'side' | 'vine';

export type PlantLayer = 'back' | 'front';

export type PlantEdge = 'left' | 'right';

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
};

type PlantSpec = Omit<PlantInstance, 'id'>;

/**
 * Authored corner clusters, not a random scatter. Sprites hang off the
 * viewport so only a leaf edge overlaps a card corner (8–16%), never the
 * intro portrait or track title.
 */
const COMPOSITIONS: Record<GreenhouseSurface, ReadonlyArray<PlantSpec>> = {
  '/music': [
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: -18,
      scale: 1.45,
      symbol: 'leaf-bop',
      x: -18,
      y: 10,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 16,
      scale: 1.3,
      symbol: 'leaf-monstera',
      x: -16,
      y: 36,
    },
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: 8,
      scale: 1.15,
      symbol: 'leaf-zz',
      x: -20,
      y: 52,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: true,
      layer: 'front',
      rotate: 18,
      scale: 1.35,
      symbol: 'leaf-bop',
      x: -12,
      y: -6,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -14,
      scale: 1.05,
      symbol: 'leaf-calathea',
      x: -10,
      y: 58,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 10,
      scale: 0.78,
      symbol: 'leaf-nerve',
      x: -4,
      y: 22,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -22,
      scale: 0.92,
      symbol: 'leaf-pothos',
      x: -14,
      y: 8,
    },
  ],
  '/music/albums': [
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 12,
      scale: 1.4,
      symbol: 'leaf-pothos',
      x: -18,
      y: 14,
    },
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: -20,
      scale: 1.25,
      symbol: 'leaf-calathea',
      x: -16,
      y: 40,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 6,
      scale: 1.1,
      symbol: 'leaf-zz',
      x: -14,
      y: 60,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: true,
      layer: 'front',
      rotate: -16,
      scale: 1.28,
      symbol: 'leaf-pothos',
      x: -12,
      y: 54,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 24,
      scale: 1.02,
      symbol: 'leaf-nerve',
      x: -8,
      y: -4,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 8,
      scale: 0.95,
      symbol: 'leaf-monstera',
      x: -14,
      y: 58,
    },
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -8,
      scale: 0.8,
      symbol: 'leaf-prayer',
      x: -6,
      y: 18,
    },
  ],
  home: [
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: -28,
      scale: 1.55,
      symbol: 'leaf-monstera',
      x: -12,
      y: -4,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 14,
      scale: 1.35,
      symbol: 'leaf-calathea',
      x: -10,
      y: 2,
    },
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'back',
      rotate: -8,
      scale: 1.2,
      symbol: 'leaf-zz',
      x: -14,
      y: 48,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'back',
      rotate: 10,
      scale: 1.18,
      symbol: 'leaf-prayer',
      x: -8,
      y: 54,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: true,
      layer: 'front',
      rotate: -18,
      scale: 1.22,
      symbol: 'leaf-monstera',
      x: -12,
      y: -8,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: 18,
      scale: 0.72,
      symbol: 'leaf-nerve',
      x: -1,
      y: 34,
    },
    {
      cluster: 'vine',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -6,
      scale: 0.82,
      symbol: 'leaf-pothos',
      x: -5,
      y: 20,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 22,
      scale: 1.08,
      symbol: 'leaf-calathea',
      x: -6,
      y: -6,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: -12,
      scale: 0.72,
      symbol: 'leaf-nerve',
      x: 0,
      y: 24,
    },
    {
      cluster: 'corner',
      edge: 'left',
      featured: false,
      layer: 'front',
      rotate: -8,
      scale: 1.18,
      symbol: 'leaf-bop',
      x: -10,
      y: 52,
    },
    {
      cluster: 'corner',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 14,
      scale: 1.1,
      symbol: 'leaf-calathea',
      x: -8,
      y: 52,
    },
    {
      cluster: 'side',
      edge: 'right',
      featured: false,
      layer: 'front',
      rotate: 32,
      scale: 0.7,
      symbol: 'leaf-nerve',
      x: 2,
      y: 42,
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
    y: plant.y + (plant.layer === 'back' ? nudge * 0.4 : 0),
  }));
}
