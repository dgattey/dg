export const LEAF_SYMBOLS = [
  'leaf-bop',
  'leaf-calathea',
  'leaf-monstera',
  'leaf-nerve',
  'leaf-pothos',
  'leaf-prayer',
  'leaf-zz',
] as const;

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
 * Home desktop: one of each species inside 1440. Side peeks are portrait
 * cutouts the plate does not already paint at that edge (no BoP on the
 * left, no monstera on the right), both `front`. Ultrawide fillers may
 * repeat a far twin (flipped, different scale/rotation, ≥ 600px away).
 */
const HOME_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -8,
    scale: 0.78,
    symbol: 'leaf-zz',
    x: -4,
    y: -34,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 0.86,
    symbol: 'leaf-prayer',
    x: 14,
    y: -22,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -5,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 36,
    y: -24,
    z: 3,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 4,
    scale: 0.72,
    symbol: 'leaf-pothos',
    x: 58,
    y: -36,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 10,
    scale: 0.8,
    symbol: 'leaf-calathea',
    x: 82,
    y: -24,
    z: 2,
  },
  {
    cluster: 'side',
    edge: 'left',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: -10,
    scale: 0.82,
    symbol: 'leaf-monstera',
    x: -8,
    y: 18,
    z: 3,
  },
  {
    cluster: 'side',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 9,
    scale: 0.86,
    symbol: 'leaf-bop',
    x: -6,
    y: 16,
    z: 4,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    minWidth: 1800,
    rotate: 12,
    scale: 0.7,
    symbol: 'leaf-calathea',
    x: -12,
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
    rotate: 14,
    scale: 0.7,
    symbol: 'leaf-zz',
    x: 98,
    y: -34,
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
    rotate: -6,
    scale: 0.82,
    symbol: 'leaf-zz',
    x: -6,
    y: -28,
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
    symbol: 'leaf-prayer',
    x: 22,
    y: -18,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 3,
    scale: 0.72,
    symbol: 'leaf-pothos',
    x: 54,
    y: -32,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -4,
    scale: 0.9,
    symbol: 'leaf-nerve',
    x: 84,
    y: -20,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.78,
    symbol: 'leaf-bop',
    x: -32,
    y: 72,
    z: 3,
  },
];

const MUSIC_DESKTOP: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -7,
    scale: 0.76,
    symbol: 'leaf-zz',
    x: -2,
    y: -24,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 0.84,
    symbol: 'leaf-prayer',
    x: 24,
    y: -14,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 3,
    scale: 0.72,
    symbol: 'leaf-pothos',
    x: 46,
    y: -26,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -5,
    scale: 0.88,
    symbol: 'leaf-nerve',
    x: 68,
    y: -14,
    z: 3,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 8,
    scale: 0.8,
    symbol: 'leaf-calathea',
    x: 86,
    y: -12,
    z: 2,
  },
  {
    cluster: 'corner',
    edge: 'left',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: -8,
    scale: 0.78,
    symbol: 'leaf-monstera',
    x: -32,
    y: 70,
    z: 3,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 10,
    scale: 0.84,
    symbol: 'leaf-bop',
    x: -32,
    y: 68,
    z: 4,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    minWidth: 1800,
    rotate: -9,
    scale: 0.7,
    symbol: 'leaf-calathea',
    x: -10,
    y: -16,
    z: 2,
  },
];

const MUSIC_MOBILE: ReadonlyArray<PlantSpec> = [
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: -5,
    scale: 0.8,
    symbol: 'leaf-zz',
    x: 2,
    y: -14,
    z: 1,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    flip: true,
    layer: 'front',
    rotate: 6,
    scale: 0.86,
    symbol: 'leaf-prayer',
    x: 34,
    y: -6,
    z: 2,
  },
  {
    cluster: 'vine',
    edge: 'bottom',
    featured: false,
    layer: 'front',
    rotate: 2,
    scale: 0.72,
    symbol: 'leaf-pothos',
    x: 66,
    y: -22,
    z: 1,
  },
  {
    cluster: 'corner',
    edge: 'right',
    featured: true,
    layer: 'front',
    rotate: 8,
    scale: 0.78,
    symbol: 'leaf-bop',
    x: -36,
    y: 78,
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
