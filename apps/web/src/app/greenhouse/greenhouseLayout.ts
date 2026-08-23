export const LEAF_SYMBOLS = ['leaf-calathea', 'leaf-nerve', 'leaf-bop', 'leaf-monstera'] as const;

export type LeafSymbol = (typeof LEAF_SYMBOLS)[number];

export type GreenhouseSurface = 'home' | 'music';

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
  /** Paint order inside the stack. Higher sits closer to the viewer. */
  z?: number;
  /** Hide below this CSS width. Used for ultrawide end fillers. */
  minWidth?: number;
};

type PlantSpec = Omit<PlantInstance, 'id'>;

/**
 * Home desktop: a shallow bottom fringe of distinct cutouts plus two
 * in-document side peeks. No two neighbors share symbol and flip.
 * Corner accents rise higher than the dense mass; fillers hang lower.
 */
const HOME_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -11,
    scale: 0.86,
    symbol: 'leaf-calathea',
    x: 3,
    y: -10,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 7,
    scale: 0.7,
    symbol: 'leaf-bop',
    x: 18,
    y: -24,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -4,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 37,
    y: -8,
    z: 3,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 0.7,
    symbol: 'leaf-monstera',
    x: 54,
    y: -22,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 12,
    scale: 0.78,
    symbol: 'leaf-calathea',
    x: 71,
    y: -11,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -8,
    scale: 0.84,
    symbol: 'leaf-nerve',
    x: 84,
    y: -7,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -10,
    scale: 0.9,
    symbol: 'leaf-bop',
    x: -12,
    y: -26,
    z: 4,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.88,
    symbol: 'leaf-monstera',
    x: 90,
    y: -36,
    z: 4,
  },
  {
    cluster: 'side',
    edge: 'left',
    featured: false,
    flip: true,
    layer: 'back',
    rotate: -12,
    scale: 0.76,
    symbol: 'leaf-bop',
    x: -22,
    y: 46,
    z: 0,
  },
  {
    cluster: 'side',
    edge: 'right',
    featured: false,
    flip: true,
    layer: 'back',
    rotate: 11,
    scale: 0.72,
    symbol: 'leaf-monstera',
    x: -24,
    y: 40,
    z: 0,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    minWidth: 1800,
    rotate: 6,
    scale: 0.84,
    symbol: 'leaf-bop',
    x: -4,
    y: -22,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    minWidth: 1800,
    rotate: -8,
    scale: 0.8,
    symbol: 'leaf-calathea',
    x: 94,
    y: -9,
    z: 2,
  },
];

/**
 * Mobile: bottom fringe only, plus one small right peek. The intro name
 * column stays empty.
 */
const HOME_MOBILE: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -8,
    scale: 0.95,
    symbol: 'leaf-calathea',
    x: 0,
    y: -3,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 5,
    scale: 0.72,
    symbol: 'leaf-bop',
    x: 24,
    y: -14,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -3,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 52,
    y: -2,
    z: 3,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 9,
    scale: 0.82,
    symbol: 'leaf-calathea',
    x: 78,
    y: -4,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -10,
    scale: 0.88,
    symbol: 'leaf-bop',
    x: -16,
    y: -14,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.82,
    symbol: 'leaf-monstera',
    x: -18,
    y: 62,
    z: 3,
  },
];

const MUSIC_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -9,
    scale: 0.84,
    symbol: 'leaf-nerve',
    x: 6,
    y: -8,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 8,
    scale: 0.76,
    symbol: 'leaf-calathea',
    x: 28,
    y: -10,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -6,
    scale: 0.7,
    symbol: 'leaf-bop',
    x: 49,
    y: -22,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 5,
    scale: 0.88,
    symbol: 'leaf-nerve',
    x: 70,
    y: -7,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 7,
    scale: 0.82,
    symbol: 'leaf-monstera',
    x: 90,
    y: -22,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 10,
    scale: 0.88,
    symbol: 'leaf-bop',
    x: -20,
    y: 58,
    z: 4,
  },
  {
    cluster: 'side',
    edge: 'left',
    featured: false,
    layer: 'back',
    rotate: -14,
    scale: 0.7,
    symbol: 'leaf-bop',
    x: -30,
    y: 64,
    z: 0,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    minWidth: 1800,
    rotate: -6,
    scale: 0.8,
    symbol: 'leaf-nerve',
    x: -2,
    y: -8,
    z: 2,
  },
];

const MUSIC_MOBILE: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -6,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 2,
    y: -2,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 8,
    scale: 0.74,
    symbol: 'leaf-bop',
    x: 36,
    y: -13,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -4,
    scale: 0.88,
    symbol: 'leaf-calathea',
    x: 68,
    y: -3,
    z: 1,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 10,
    scale: 0.8,
    symbol: 'leaf-bop',
    x: -20,
    y: 68,
    z: 3,
  },
];

const COMPOSITIONS: Record<
  GreenhouseSurface,
  Record<GreenhouseViewport, ReadonlyArray<PlantSpec>>
> = {
  home: { desktop: HOME_DESKTOP, mobile: HOME_MOBILE },
  music: { desktop: MUSIC_DESKTOP, mobile: MUSIC_MOBILE },
};

/**
 * Plants that paint at `width`. Ultrawide fillers stay out of narrower
 * viewports so they cannot stamp the 1440 composition.
 */
export function plantsVisibleAt(
  plants: ReadonlyArray<PlantInstance>,
  width: number,
): ReadonlyArray<PlantInstance> {
  return plants.filter((plant) => plant.minWidth == null || width >= plant.minWidth);
}

/**
 * Deterministic plant placement for a greenhouse surface. Same input always
 * yields the same plants.
 */
export function layoutGreenhousePlants(
  surface: GreenhouseSurface,
  contentHint = 0,
  viewport: GreenhouseViewport = 'desktop',
): ReadonlyArray<PlantInstance> {
  const specs = COMPOSITIONS[surface][viewport];
  const nudge = (contentHint % 5) - 2;
  return specs.map((plant, index) => ({
    ...plant,
    id: `${surface}-${viewport}-${plant.symbol}-${plant.layer}-${index}`,
    scale: Math.min(plant.scale, 1.4),
    y: plant.y + (plant.layer === 'back' ? nudge * 0.4 : 0),
  }));
}
