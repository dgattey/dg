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
 * Home desktop: one cutout per species on card corners. Edge strips and
 * the bottom band do the lushness; these overlap the corners.
 */
const HOME_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'corner',
    edge: 'left',
    featured: false,
    layer: 'front',
    rotate: -10,
    scale: 0.92,
    symbol: 'leaf-bop',
    x: -14,
    y: -6,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.96,
    symbol: 'leaf-monstera',
    x: -16,
    y: -18,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 0.88,
    symbol: 'leaf-calathea',
    x: 6,
    y: -18,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -8,
    scale: 0.82,
    symbol: 'leaf-nerve',
    x: 86,
    y: -16,
  },
];

/**
 * Mobile: top-right + bottom corners. Strips carry the rest. The intro
 * name column stays empty.
 */
const HOME_MOBILE: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.9,
    symbol: 'leaf-monstera',
    x: -10,
    y: -10,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -7,
    scale: 1.05,
    symbol: 'leaf-bop',
    x: -8,
    y: -22,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -6,
    scale: 0.8,
    symbol: 'leaf-nerve',
    x: 78,
    y: -18,
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
