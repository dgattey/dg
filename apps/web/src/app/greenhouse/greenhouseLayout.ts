export const LEAF_SYMBOLS = ['leaf-calathea', 'leaf-nerve', 'leaf-bop', 'leaf-monstera'] as const;

export type LeafSymbol = (typeof LEAF_SYMBOLS)[number];

export type GreenhouseSurface = 'home' | '/music' | '/music/albums';

export type GreenhouseViewport = 'desktop' | 'mobile';

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
 * Home desktop: 17 instances flush to the viewport. Density lives in the
 * left/right margins, the column gutter, and a bottom thicket whose bases
 * sit below the fold. Copy wells are in `homeSafeRects`.
 */
const HOME_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'side',
    edge: 'left',
    featured: false,
    layer: 'back',
    rotate: -9,
    scale: 1.34,
    symbol: 'leaf-bop',
    x: -8,
    y: 0,
  },
  {
    cluster: 'corner',
    edge: 'left',
    featured: false,
    layer: 'front',
    rotate: -13,
    scale: 1.02,
    symbol: 'leaf-bop',
    x: -3,
    y: 16,
  },
  {
    cluster: 'corner',
    edge: 'left',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 10,
    scale: 0.86,
    symbol: 'leaf-calathea',
    x: -5,
    y: 36,
  },
  {
    cluster: 'side',
    edge: 'left',
    featured: false,
    layer: 'back',
    rotate: -7,
    scale: 1.22,
    symbol: 'leaf-monstera',
    x: -13,
    y: 44,
  },
  {
    cluster: 'corner',
    edge: 'left',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 8,
    scale: 0.72,
    symbol: 'leaf-nerve',
    x: -2,
    y: 74,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 9,
    scale: 1.12,
    symbol: 'leaf-monstera',
    x: -5,
    y: -8,
  },
  {
    cluster: 'side',
    edge: 'right',
    featured: false,
    flip: true,
    layer: 'back',
    rotate: 11,
    scale: 1.32,
    symbol: 'leaf-monstera',
    x: -9,
    y: 12,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: false,
    layer: 'front',
    rotate: -11,
    scale: 0.82,
    symbol: 'leaf-calathea',
    x: -3,
    y: 30,
  },
  {
    cluster: 'side',
    edge: 'right',
    featured: false,
    flip: true,
    layer: 'back',
    rotate: -7,
    scale: 1.16,
    symbol: 'leaf-calathea',
    x: -11,
    y: 50,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: false,
    layer: 'front',
    rotate: 12,
    scale: 0.74,
    symbol: 'leaf-nerve',
    x: -2,
    y: 66,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: -7,
    scale: 1.06,
    symbol: 'leaf-bop',
    x: 0,
    y: -18,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 8,
    scale: 1.14,
    symbol: 'leaf-calathea',
    x: 12,
    y: -9,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -5,
    scale: 0.98,
    symbol: 'leaf-nerve',
    x: 26,
    y: -8,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 1.18,
    symbol: 'leaf-calathea',
    x: 30,
    y: -13,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 10,
    scale: 0.94,
    symbol: 'leaf-bop',
    x: 58,
    y: -34,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 8,
    scale: 1.05,
    symbol: 'leaf-monstera',
    x: 74,
    y: -38,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -8,
    scale: 0.88,
    symbol: 'leaf-nerve',
    x: 68,
    y: -10,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: -9,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 86,
    y: -8,
  },
];

/**
 * Mobile: top-right + bottom only. The intro name column stays empty.
 */
const HOME_MOBILE: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.95,
    symbol: 'leaf-monstera',
    x: -6,
    y: -6,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: false,
    layer: 'front',
    rotate: -11,
    scale: 0.72,
    symbol: 'leaf-nerve',
    x: -2,
    y: 10,
  },
  {
    cluster: 'side',
    edge: 'right',
    featured: false,
    flip: true,
    layer: 'back',
    rotate: 10,
    scale: 1.12,
    symbol: 'leaf-calathea',
    x: -10,
    y: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -7,
    scale: 1.15,
    symbol: 'leaf-bop',
    x: 0,
    y: -20,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 7,
    scale: 1.2,
    symbol: 'leaf-calathea',
    x: 14,
    y: -8,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: -4,
    scale: 1.05,
    symbol: 'leaf-nerve',
    x: 32,
    y: -8,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 8,
    scale: 1.14,
    symbol: 'leaf-calathea',
    x: 50,
    y: -6,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 9,
    scale: 1.1,
    symbol: 'leaf-monstera',
    x: 76,
    y: -12,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -9,
    scale: 0.98,
    symbol: 'leaf-nerve',
    x: 82,
    y: -2,
  },
];

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
  home: HOME_DESKTOP,
};

/**
 * Deterministic plant placement for a greenhouse surface. Home has a separate
 * mobile composition (top-right + bottom). Same input always yields the same
 * plants.
 */
export function layoutGreenhousePlants(
  surface: GreenhouseSurface,
  contentHint = 0,
  viewport: GreenhouseViewport = 'desktop',
): ReadonlyArray<PlantInstance> {
  const specs = surface === 'home' && viewport === 'mobile' ? HOME_MOBILE : COMPOSITIONS[surface];
  const nudge = (contentHint % 5) - 2;
  return specs.map((plant, index) => ({
    ...plant,
    id: `${surface}-${viewport}-${plant.symbol}-${plant.layer}-${index}`,
    scale: Math.min(plant.scale, 1.4),
    y: plant.y + (plant.layer === 'back' ? nudge * 0.4 : 0),
  }));
}
