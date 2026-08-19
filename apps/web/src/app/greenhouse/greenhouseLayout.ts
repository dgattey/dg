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

export type PlantInstance = {
  id: string;
  symbol: LeafSymbol;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  layer: PlantLayer;
  cluster: PlantCluster;
  featured: boolean;
};

type SafeRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type SurfaceMix = {
  featured: LeafSymbol;
  denseCorners: ReadonlyArray<'tl' | 'tr' | 'bl' | 'br'>;
  vineSide: 'left' | 'right';
};

const SURFACE_MIX: Record<GreenhouseSurface, SurfaceMix> = {
  '/music': {
    denseCorners: ['tr', 'bl'],
    featured: 'leaf-bop',
    vineSide: 'left',
  },
  '/music/albums': {
    denseCorners: ['bl', 'br'],
    featured: 'leaf-pothos',
    vineSide: 'right',
  },
  home: {
    denseCorners: ['tl', 'br'],
    featured: 'leaf-monstera',
    vineSide: 'left',
  },
};

const HOME_SAFE_RECTS: ReadonlyArray<SafeRect> = [
  { h: 10, w: 16, x: 30, y: 20 },
  { h: 10, w: 14, x: 58, y: 22 },
  { h: 10, w: 16, x: 30, y: 54 },
  { h: 10, w: 14, x: 58, y: 56 },
];

const MUSIC_SAFE_RECTS: ReadonlyArray<SafeRect> = [
  { h: 12, w: 40, x: 30, y: 4 },
  { h: 46, w: 70, x: 15, y: 22 },
];

const CORNER_ANCHORS: Record<'tl' | 'tr' | 'bl' | 'br', { x: number; y: number }> = {
  bl: { x: -10, y: 58 },
  br: { x: 62, y: 56 },
  tl: { x: -12, y: -8 },
  tr: { x: 64, y: -10 },
};

const hashString = (input: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const leafBox = (plant: Pick<PlantInstance, 'x' | 'y' | 'scale'>): SafeRect => ({
  h: plant.scale * 16,
  w: plant.scale * 16,
  x: plant.x,
  y: plant.y,
});

const overlaps = (a: SafeRect, b: SafeRect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const coversSafeRect = (plant: PlantInstance, rects: ReadonlyArray<SafeRect>): boolean => {
  const box = leafBox(plant);
  return rects.some((rect) => overlaps(box, rect));
};

const pickSymbol = (
  next: () => number,
  featured: LeafSymbol,
  preferFeatured: boolean,
): LeafSymbol => {
  if (preferFeatured && next() < 0.45) {
    return featured;
  }
  const index = Math.floor(next() * LEAF_SYMBOLS.length);
  return LEAF_SYMBOLS[index] ?? featured;
};

const tryPlace = (
  next: () => number,
  base: Omit<PlantInstance, 'id' | 'rotate' | 'scale' | 'symbol'> & { symbol: LeafSymbol },
  rects: ReadonlyArray<SafeRect>,
): PlantInstance | null => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const scale = (base.featured ? 1.85 : 1.05) + next() * (base.featured ? 0.7 : 0.55);
    const rotate = (next() - 0.5) * 70;
    const candidate: PlantInstance = {
      ...base,
      id: `${base.symbol}-${base.layer}-${base.cluster}-${base.x.toFixed(2)}-${base.y.toFixed(2)}`,
      rotate,
      scale: Math.max(0.45, scale * (attempt === 0 ? 1 : 0.82 ** attempt)),
    };
    if (!coversSafeRect(candidate, rects)) {
      return candidate;
    }
  }
  return null;
};

const safeRectsFor = (surface: GreenhouseSurface): ReadonlyArray<SafeRect> =>
  surface === 'home' ? HOME_SAFE_RECTS : MUSIC_SAFE_RECTS;

/**
 * Deterministic plant placement for a greenhouse surface. Same input always
 * yields the same plants. Layouts differ across surfaces so a later camera pan
 * can show a different corner of the same vocabulary.
 */
export function layoutGreenhousePlants(
  surface: GreenhouseSurface,
  contentHint = 0,
): ReadonlyArray<PlantInstance> {
  const mix = SURFACE_MIX[surface];
  const next = mulberry32(hashString(`${surface}:${contentHint}`));
  const rects = safeRectsFor(surface);
  const plants: Array<PlantInstance> = [];

  const push = (plant: PlantInstance | null) => {
    if (plant) {
      plants.push(plant);
    }
  };

  for (const corner of mix.denseCorners) {
    const anchor = CORNER_ANCHORS[corner];
    const count = 4 + Math.floor(next() * 2);
    for (let index = 0; index < count; index += 1) {
      push(
        tryPlace(
          next,
          {
            cluster: 'corner',
            featured: index === 0,
            layer: index === 0 ? 'front' : next() < 0.25 ? 'back' : 'front',
            symbol: pickSymbol(next, mix.featured, index === 0),
            x: anchor.x + next() * 14 - 2,
            y: anchor.y + next() * 16 - 2,
          },
          rects,
        ),
      );
    }
  }

  for (const corner of (['tl', 'tr', 'bl', 'br'] as const).filter(
    (corner) => !mix.denseCorners.includes(corner),
  )) {
    const anchor = CORNER_ANCHORS[corner];
    const count = 2 + Math.floor(next() * 2);
    for (let index = 0; index < count; index += 1) {
      push(
        tryPlace(
          next,
          {
            cluster: 'side',
            featured: false,
            layer: 'front',
            symbol: pickSymbol(next, mix.featured, false),
            x: anchor.x + next() * 12,
            y: anchor.y + next() * 14,
          },
          rects,
        ),
      );
    }
  }

  const vineX = mix.vineSide === 'left' ? -8 : 68;
  const vineCount = 4 + Math.floor(next() * 2);
  for (let index = 0; index < vineCount; index += 1) {
    push(
      tryPlace(
        next,
        {
          cluster: 'vine',
          featured: false,
          layer: index % 3 === 0 ? 'back' : 'front',
          symbol: pickSymbol(next, mix.featured, false),
          x: vineX + next() * 8 - 2,
          y: 8 + index * 18 + next() * 6,
        },
        rects,
      ),
    );
  }

  const front = plants.filter((plant) => plant.layer === 'front').slice(0, 24);
  const back = plants.filter((plant) => plant.layer === 'back').slice(0, 8);
  return [...back, ...front];
}
