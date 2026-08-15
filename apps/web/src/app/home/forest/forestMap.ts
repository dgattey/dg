/**
 * Deterministic generator for the walkable forest island.
 *
 * Everything here is pure so the whole landscape can be built during the server
 * render and shipped as markup. The client only ever receives the blocked-tile
 * mask, which is all the walker needs to stop people wading into the ocean.
 */

/** Pixel size of one map tile. Collision and walking stay on this grid; the ground bitmap samples finer than it so the island does not read as 48px blocks. */
export const TILE_SIZE = 48;

export type TerrainKind =
  | 'bridge'
  | 'clearing'
  | 'grass'
  | 'hill'
  | 'lake'
  | 'meadow'
  | 'mountain'
  | 'ocean'
  | 'path'
  | 'sand'
  | 'shallow'
  | 'trail'
  | 'wetland';

export type SceneryKind =
  | 'birch'
  | 'bloom'
  | 'bush'
  | 'cedar'
  | 'dead'
  | 'fruit'
  | 'log'
  | 'maple'
  | 'oak'
  | 'pine'
  | 'reed'
  | 'rock'
  | 'stump'
  | 'willow';

export type ScenerySprite = {
  kind: SceneryKind;
  scale: number;
  tileX: number;
  tileY: number;
  /**
   * When false, the stamp still paints (and can occlude a plaque) but the
   * walker can pass through. South grove trees use this so the trail stays
   * clear while canopies stand in front of the lower third.
   */
  blocks?: boolean;
};

export type CritterKind = 'bird' | 'deer' | 'fish' | 'fox' | 'rabbit';

export type ForestCritter = {
  delayMs: number;
  kind: CritterKind;
  tileX: number;
  tileY: number;
};

/** A cleared spot in the forest that one homepage card is planted on. */
export type ForestPlot = {
  id: string;
  region: LandmarkRegion;
  tileX: number;
  tileY: number;
};

/** Biome role used only to place cards. Never shown as a caption. */
export type LandmarkRegion = 'marsh' | 'meadow' | 'peak' | 'shore' | 'water' | 'woods';

export type ForestWorld = {
  columns: number;
  critters: Array<ForestCritter>;
  plots: Array<ForestPlot>;
  rows: number;
  scenery: Array<ScenerySprite>;
  seed: number;
  spawn: { tileX: number; tileY: number };
  terrain: Array<Array<TerrainKind>>;
};

/** Horizontal runs of one terrain kind, so a row becomes a handful of rects. */
export type TerrainRun = {
  kind: TerrainKind;
  length: number;
  tileX: number;
  tileY: number;
};

/**
 * Every landmark reserves the same rectangle of ground, measured in tiles, and
 * the whole layout is derived from it so two boards can never overlap. The
 * plaque is bottom-anchored on the plot's trail tile and stands entirely north
 * of it, so the footprint is all upward: `FOOTPRINT_NORTH` tiles tall and
 * `FOOTPRINT_WIDTH` wide, centred on the anchor.
 *
 * The board component clamps its own rendered size to this rectangle (see
 * `LANDMARK_CONTENT_WIDTH_PX` / `LANDMARK_MAX_HEIGHT_PX`), so variable-height
 * cards — a long side-project list, a live tracklist — stay inside their plot
 * instead of growing into a neighbour.
 */
export const FOOTPRINT_WIDTH = 7;
export const FOOTPRINT_NORTH = 8;

/**
 * Pixel budget the board's content fills. Width leaves half a tile of frame
 * inside the reserved rectangle; height leaves room for the posts, frame,
 * nameplate and gap on top of the content so the whole plaque still fits inside
 * `FOOTPRINT_NORTH` and can never grow into the plot above it.
 */
export const LANDMARK_CONTENT_WIDTH_PX = (FOOTPRINT_WIDTH - 0.5) * TILE_SIZE;
const LANDMARK_CHROME_BUDGET_PX = 84;
export const LANDMARK_MAX_HEIGHT_PX = FOOTPRINT_NORTH * TILE_SIZE - LANDMARK_CHROME_BUDGET_PX;

/**
 * How far a south-grove stamp may rise above the plot origin. That band is
 * posts plus the bottom wood of the frame — not the photograph, body text, or
 * nameplate. Tallest sprite (cedar) is used when capping so a pine cannot
 * grow through a face.
 */
export const SOUTH_GROVE_MAX_OVERHANG_PX = 40;

/** Matches `SPRITE_SCALE` so a cap in tiles is a cap on screen. */
const STAMP_TILES: Record<SceneryKind, { height: number; width: number }> = {
  birch: { height: 3.15, width: 1.8 },
  bloom: { height: 0.85, width: 0.85 },
  bush: { height: 1.25, width: 1.9 },
  cedar: { height: 3.7, width: 1.6 },
  dead: { height: 2.9, width: 1.8 },
  fruit: { height: 2.8, width: 2.25 },
  log: { height: 0.8, width: 2.1 },
  maple: { height: 3.1, width: 2.55 },
  oak: { height: 3, width: 2.65 },
  pine: { height: 3.5, width: 2.05 },
  reed: { height: 1.55, width: 1.05 },
  rock: { height: 1, width: 1.35 },
  stump: { height: 1, width: 1.15 },
  willow: { height: 2.85, width: 3 },
};

/**
 * Plot geometry, in tiles. Cells are the footprint plus a guaranteed margin, so
 * the gap between neighbours is `CELL - FOOTPRINT` on every side — enough forest
 * that the trail reads as a walk, and enough that no jitter is needed (and none
 * is used, so spacing stays provable).
 */
const WORLD_COLUMNS = 62;
const MIN_WORLD_ROWS = 86;

/** Tiles around a plot centre that stay clear of trees, rocks and peaks. */
const PLOT_PROTECT_RADIUS = 4.6;
const CLEARING_RADIUS = 2.7;

/**
 * Radius around a plot anchor that stays free of scenery. Comfortably covers the
 * two-tile ring the trail and the walker need, so stepping up to a sign is never
 * blocked by something that grew next to it.
 */
const SCENERY_CLEAR_RADIUS = 3.2;

/** Trail width in tiles. Two is wide enough to walk, narrow enough to read as a path. */
const TRAIL_WIDTH = 2;

export const DEFAULT_FOREST_SEED = 20_260_812;

let activeSeed = DEFAULT_FOREST_SEED;

/** Run a sampler with this world's seed, then put the previous seed back. */
export function withWorldSeed<T>(seed: number, fn: () => T): T {
  const previous = activeSeed;
  activeSeed = seed >>> 0 || 1;
  try {
    return fn();
  } finally {
    activeSeed = previous;
  }
}

const WALKABLE_TERRAIN: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'bridge',
  'clearing',
  'grass',
  'hill',
  'meadow',
  'path',
  'sand',
  'trail',
  'wetland',
]);

export const TREE_KINDS: ReadonlySet<SceneryKind> = new Set<SceneryKind>([
  'birch',
  'cedar',
  'dead',
  'fruit',
  'maple',
  'oak',
  'pine',
  'willow',
]);

const BLOCKING_SCENERY: ReadonlySet<SceneryKind> = new Set<SceneryKind>([...TREE_KINDS, 'rock']);

/** Stacking order so a tree south of a board paints in front of it. Terrain is 0. */
export const layerZ = (tileY: number) => tileY + 1;

/** Attribute the scene uses to drive the minimap "you are here" marker. */
export const MINIMAP_MARKER_ROLE = 'forest-minimap-marker';

/** Stable 0..1 hash. Nothing random reaches the client, so SSR and hydration agree. */
function hashUnit(x: number, y: number, salt: number): number {
  let h =
    Math.imul(x + 0x1f1f, 0x27d4_eb2d) ^
    Math.imul(y + 0x9e37, 0x1656_67b1) ^
    Math.imul(salt + activeSeed, 0x2545_f491);
  h = Math.imul(h ^ (h >>> 15), 0x85eb_ca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2_ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 0x1_0000_0000;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Gradient noise. Value noise prints a square lattice (the grass checker).
 * Perlin dots random gradients so the same octaves read as flow, not tiles.
 */
export function perlinNoise(x: number, y: number, scale: number, salt: number): number {
  const gridX = x / scale;
  const gridY = y / scale;
  const cellX = Math.floor(gridX);
  const cellY = Math.floor(gridY);
  const fx = gridX - cellX;
  const fy = gridY - cellY;
  const grad = (ix: number, iy: number, dx: number, dy: number) => {
    const pick = (hashUnit(ix, iy, salt) * 8) | 0;
    const gx = pick & 1 ? 1 : -1;
    const gy = pick & 2 ? 1 : -1;
    return (pick & 4 ? gx * dx : gy * dy) + (pick & 4 ? gy * dy * 0.35 : gx * dx * 0.35);
  };
  const u = fade(fx);
  const v = fade(fy);
  const n =
    lerp(
      lerp(grad(cellX, cellY, fx, fy), grad(cellX + 1, cellY, fx - 1, fy), u),
      lerp(grad(cellX, cellY + 1, fx, fy - 1), grad(cellX + 1, cellY + 1, fx - 1, fy - 1), u),
      v,
    ) *
      0.5 +
    0.5;
  return Math.min(1, Math.max(0, n));
}

/** Bilinear value noise — enough shape for coastlines, grain, and tree clumps. */
export function valueNoise(x: number, y: number, scale: number, salt: number): number {
  const gridX = x / scale;
  const gridY = y / scale;
  const cellX = Math.floor(gridX);
  const cellY = Math.floor(gridY);
  const fractionX = smoothstep(gridX - cellX);
  const fractionY = smoothstep(gridY - cellY);
  const top = lerp(hashUnit(cellX, cellY, salt), hashUnit(cellX + 1, cellY, salt), fractionX);
  const bottom = lerp(
    hashUnit(cellX, cellY + 1, salt),
    hashUnit(cellX + 1, cellY + 1, salt),
    fractionX,
  );
  return lerp(top, bottom, fractionY);
}

const REGION_FOR_ID: ReadonlyArray<[RegExp, LandmarkRegion]> = [
  [/spotify/i, 'woods'],
  [/strava/i, 'peak'],
  [/map/i, 'water'],
  [/gattey-sites/i, 'meadow'],
  [/intro/i, 'meadow'],
];

const preferredRegion = (id: string): LandmarkRegion | undefined =>
  REGION_FOR_ID.find(([pattern]) => pattern.test(id))?.[1];

const SLOT_LAND: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'grass',
  'hill',
  'meadow',
  'sand',
  'wetland',
]);

const ROUTE_KINDS: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'bridge',
  'clearing',
  'path',
  'trail',
]);

export function generateForestSeed(): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0] || 1) >>> 0;
}

/**
 * Finds walkable clearings on already-generated terrain, then hands cards to
 * slots that match their biome preference so neighborhoods stay familiar:
 * listening in the woods, activity up high, the map by water.
 */
function meanPoint(points: ReadonlyArray<{ tileX: number; tileY: number }>) {
  if (points.length === 0) {
    return { tileX: 0, tileY: 0 };
  }
  return {
    tileX: points.reduce((sum, point) => sum + point.tileX, 0) / points.length,
    tileY: points.reduce((sum, point) => sum + point.tileY, 0) / points.length,
  };
}

function takeClosestSlot(
  pool: ReadonlyArray<{ region: LandmarkRegion; tileX: number; tileY: number }>,
  target: { tileX: number; tileY: number },
) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < pool.length; index++) {
    const slot = pool[index];
    if (!slot) {
      continue;
    }
    const distance = Math.hypot(slot.tileX - target.tileX, slot.tileY - target.tileY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  return pool[bestIndex];
}

function layOutPlots(
  ids: ReadonlyArray<string>,
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
): Array<ForestPlot> {
  const slots = collectSlots(terrain, columns, rows, ids.length);
  const available = slots.slice();
  const placed: Array<ForestPlot> = [];
  return ids.map((id) => {
    const desired = preferredRegion(id);
    const matching = desired ? available.filter((slot) => slot.region === desired) : [];
    const pool = matching.length > 0 ? matching : available;
    const neighbors = desired ? placed.filter((plot) => plot.region === desired) : placed;
    const target = neighbors.length > 0 ? meanPoint(neighbors) : meanPoint(pool);
    const slot = takeClosestSlot(pool, target);
    if (!slot) {
      throw new Error(`Forest world could not place ${ids.length} landmarks`);
    }
    const availableIndex = available.findIndex(
      (candidate) => candidate.tileX === slot.tileX && candidate.tileY === slot.tileY,
    );
    available.splice(availableIndex, 1);
    const plot = { id, ...slot };
    placed.push(plot);
    return plot;
  });
}

function footprintFits(
  tileX: number,
  tileY: number,
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
): boolean {
  const halfWidth = FOOTPRINT_WIDTH / 2;
  const minX = tileX - halfWidth;
  const maxX = tileX + halfWidth;
  const minY = tileY - FOOTPRINT_NORTH;
  if (minX < 2 || minY < 2 || maxX > columns - 3 || tileY > rows - 4) {
    return false;
  }
  for (let y = Math.floor(minY); y <= tileY; y++) {
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      const kind = terrain[y]?.[x];
      if (!kind || !SLOT_LAND.has(kind)) {
        return false;
      }
    }
  }
  return true;
}

function classifySlot(
  tileX: number,
  tileY: number,
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
): LandmarkRegion {
  let water = 0;
  let marsh = 0;
  let peak = 0;
  let shore = 0;
  let meadow = 0;
  for (let y = tileY - 6; y <= tileY + 2; y++) {
    for (let x = tileX - 5; x <= tileX + 5; x++) {
      const kind = terrain[y]?.[x];
      if (kind === 'lake' || kind === 'shallow') {
        water += 1;
      } else if (kind === 'wetland') {
        marsh += 1;
      } else if (kind === 'mountain' || kind === 'hill') {
        peak += 1;
      } else if (kind === 'sand' || kind === 'ocean') {
        shore += 1;
      } else if (kind === 'meadow') {
        meadow += 1;
      }
    }
  }
  if (water >= 6) {
    return 'water';
  }
  if (peak >= 8) {
    return 'peak';
  }
  if (marsh >= 6) {
    return 'marsh';
  }
  if (shore >= 8) {
    return 'shore';
  }
  if (meadow >= 10) {
    return 'meadow';
  }
  return 'woods';
}

function footprintsConflict(
  a: { tileX: number; tileY: number },
  b: { tileX: number; tileY: number },
  pad: number,
): boolean {
  return (
    Math.abs(a.tileX - b.tileX) < FOOTPRINT_WIDTH + pad &&
    Math.abs(a.tileY - b.tileY) < FOOTPRINT_NORTH + pad
  );
}

function collectSlots(
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
  count: number,
): Array<{ region: LandmarkRegion; tileX: number; tileY: number }> {
  const candidates: Array<{ region: LandmarkRegion; tileX: number; tileY: number; rank: number }> =
    [];
  for (let y = FOOTPRINT_NORTH + 2; y < rows - 4; y += 1) {
    for (let x = 5; x < columns - 5; x += 1) {
      if (!footprintFits(x, y, terrain, columns, rows)) {
        continue;
      }
      candidates.push({
        rank: hashUnit(x, y, 211),
        region: classifySlot(x, y, terrain),
        tileX: x,
        tileY: y,
      });
    }
  }
  candidates.sort((a, b) => a.rank - b.rank);
  const regionOrder: ReadonlyArray<LandmarkRegion> = [
    'woods',
    'peak',
    'water',
    'meadow',
    'marsh',
    'shore',
  ];

  for (let pad = 3; pad >= 1; pad -= 1) {
    const picked: Array<{ region: LandmarkRegion; tileX: number; tileY: number }> = [];
    const consider = (candidate: (typeof candidates)[number]) => {
      if (picked.some((slot) => footprintsConflict(slot, candidate, pad))) {
        return false;
      }
      picked.push({
        region: candidate.region,
        tileX: candidate.tileX,
        tileY: candidate.tileY,
      });
      return picked.length >= count;
    };
    for (const region of regionOrder) {
      const candidate = candidates.find(
        (slot) =>
          slot.region === region &&
          !picked.some((pickedSlot) => footprintsConflict(pickedSlot, slot, pad)),
      );
      if (candidate && consider(candidate)) {
        return picked;
      }
    }
    for (const candidate of candidates) {
      if (consider(candidate)) {
        return picked;
      }
    }
  }
  throw new Error(`Forest world could not place ${count} landmarks`);
}

/**
 * The rectangle of tiles a landmark reserves, in map space. The board is drawn
 * from `ForestLandmark`, but this is the ground truth both the clearing carver
 * and the overlap tests use, so the reserved footprint and the rendered plaque
 * can never drift apart.
 */
export function landmarkTileRect(plot: ForestPlot) {
  const halfWidth = FOOTPRINT_WIDTH / 2;
  return {
    maxX: plot.tileX + halfWidth,
    maxY: plot.tileY,
    minX: plot.tileX - halfWidth,
    minY: plot.tileY - FOOTPRINT_NORTH,
  };
}

type Point = { x: number; y: number };

const distanceToSegment = (x: number, y: number, from: Point, to: Point) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - from.x) * dx + (y - from.y) * dy) / lengthSquared));
  return Math.hypot(x - (from.x + dx * t), y - (from.y + dy * t));
};

const riverDistance = (x: number, y: number, rows: number) => {
  const mouthX = 18 + hashUnit(0, 0, 221) * 10;
  const lakeX = 26 + hashUnit(0, 0, 223) * 14;
  const lakeY = 28 + hashUnit(0, 0, 225) * 12;
  const points = [
    { x: lakeX + 4, y: lakeY + 4 },
    { x: lakeX - 6, y: lakeY + 16 },
    { x: lakeX, y: lakeY + 30 },
    { x: mouthX, y: rows },
  ];
  let nearest = Number.POSITIVE_INFINITY;
  for (let index = 0; index < points.length - 1; index++) {
    const from = points[index];
    const to = points[index + 1];
    if (from && to) {
      nearest = Math.min(nearest, distanceToSegment(x, y, from, to));
    }
  }
  return nearest;
};

/**
 * Continuous distance fields for one sample. Collision classifies these into
 * tiles; the ground painter lerps colours across the same numbers so a coast
 * can curve instead of printing 48px stairs.
 */
export type TerrainFields = {
  island: number;
  lakeField: number;
  lakeShore: number;
  meadowBasin: number;
  meadowMix: number;
  meadowNoise: number;
  river: number;
  riverShore: number;
  riverWidth: number;
};

/** Domain-warped FBM so meadow/grass mottling is not one octave of equal blobs. */
function visualMeadowFbm(x: number, y: number) {
  const warpX = x + (perlinNoise(x, y, 5.2, 21) - 0.5) * 3.4;
  const warpY = y + (perlinNoise(x, y, 4.6, 23) - 0.5) * 3.4;
  let value = 0;
  let amplitude = 0.5;
  let scale = 8.2;
  for (let octave = 0; octave < 5; octave++) {
    value += perlinNoise(warpX, warpY, scale, 11 + octave * 17) * amplitude;
    amplitude *= 0.5;
    scale *= 0.48;
  }
  return value;
}

function terrainFieldsAt(
  x: number,
  y: number,
  columns: number,
  rows: number,
  visual = false,
): TerrainFields {
  const warpX = (valueNoise(x, y, 11, 71) - 0.5) * 4.2;
  const warpY = (valueNoise(x, y, 13, 73) - 0.5) * 4.2;
  const centreX = (columns - 1) / 2 + (hashUnit(0, 0, 201) - 0.5) * 3;
  const centreY = (rows - 1) / 2 + (hashUnit(0, 0, 203) - 0.5) * 4;
  const radiusX = columns * (0.46 + hashUnit(0, 0, 205) * 0.04);
  const radiusY = rows * (0.47 + hashUnit(0, 0, 207) * 0.04);
  const ripple = visual
    ? (perlinNoise(x, y, 5.4, 401) - 0.5) * 0.08 + (perlinNoise(x, y, 9.2, 403) - 0.5) * 0.05
    : 0;
  const island =
    Math.hypot((x + warpX - centreX) / radiusX, (y + warpY - centreY) / radiusY) +
    (valueNoise(x, y, 8, 3) - 0.5) * 0.12 +
    (valueNoise(x, y, 19, 5) - 0.5) * 0.08 +
    ripple;

  const lakeCx = 28 + hashUnit(0, 0, 231) * 14;
  const lakeCy = 30 + hashUnit(0, 0, 233) * 16;
  const lakeMain = Math.hypot(
    (x + warpX * 0.45 - lakeCx) / (7.4 + hashUnit(0, 0, 235) * 3.2),
    (y + warpY * 0.45 - lakeCy) / (5.6 + hashUnit(0, 0, 237) * 2.6),
  );
  const lakeCove = Math.hypot(
    (x - warpX * 0.3 - (lakeCx - 6)) / 5.4,
    (y + warpY * 0.3 - (lakeCy + 3)) / 4.6,
  );
  const pond = Math.hypot(
    (x - (16 + hashUnit(0, 0, 239) * 22)) / 4.2,
    (y - (52 + hashUnit(0, 0, 240) * 18)) / 3.6,
  );
  const lakeRipple = visual
    ? (perlinNoise(x, y, 4.8, 407) - 0.5) * 0.08 + (perlinNoise(x, y, 8.6, 409) - 0.5) * 0.05
    : 0;
  const lakeField = Math.min(lakeMain, lakeCove, pond) + lakeRipple;
  const river = riverDistance(x + warpX * 0.35, y + warpY * 0.35, rows);
  const riverWidth = 1.05 + valueNoise(x, y, 7, 83) * 0.9;
  const meadowNoise = visual
    ? visualMeadowFbm(x, y)
    : valueNoise(x, y, 12, 11) * 0.55 + valueNoise(x, y, 25, 13) * 0.45;
  const meadowAx = 14 + hashUnit(0, 0, 241) * 10;
  const meadowAy = 20 + hashUnit(0, 0, 243) * 10;
  const meadowBx = 34 + hashUnit(0, 0, 245) * 12;
  const meadowBy = 56 + hashUnit(0, 0, 247) * 12;
  const meadowBasin = Math.min(
    Math.hypot((x - meadowAx) / 16, (y - meadowAy) / 13),
    Math.hypot((x - meadowBx) / 18, (y - meadowBy) / 16),
  );
  const meadowMix = Math.min(
    1,
    Math.max(0, (meadowNoise - 0.42) / 0.28) + Math.max(0, (0.82 - meadowBasin) / 0.22),
  );

  return {
    island,
    lakeField,
    lakeShore: valueNoise(x, y, 4, 79),
    meadowBasin,
    meadowMix,
    meadowNoise,
    river,
    riverShore: valueNoise(x, y, 5, 89),
    riverWidth,
  };
}

function classifyTerrain(fields: TerrainFields): TerrainKind {
  if (fields.island > 1.06) {
    return 'ocean';
  }
  if (fields.island > 0.96) {
    return 'shallow';
  }
  if (fields.island > 0.88) {
    return 'sand';
  }
  if (fields.lakeField < 0.88) {
    return 'lake';
  }
  if (fields.lakeField < 1.16) {
    return fields.lakeShore > 0.42 ? 'shallow' : 'wetland';
  }
  if (fields.river < fields.riverWidth) {
    return 'lake';
  }
  if (fields.river < fields.riverWidth + 1.1) {
    return fields.riverShore > 0.35 ? 'wetland' : 'shallow';
  }
  return fields.meadowNoise > 0.55 || fields.meadowBasin < 0.72 ? 'meadow' : 'grass';
}

/**
 * Layered distance fields and value noise produce the underlying geography:
 * an irregular coast, a multi-lobed inland lake feeding a winding river, open
 * meadow basins, wetlands around water, and forest floor everywhere between.
 * Boundaries are soft and warped. Lake and meadow centres move with the seed.
 */
function baseTerrainAt(
  x: number,
  y: number,
  columns: number,
  rows: number,
  visual = false,
): TerrainKind {
  return classifyTerrain(terrainFieldsAt(x, y, columns, rows, visual));
}

const distanceTo = (x: number, y: number, plot: ForestPlot) =>
  Math.hypot(x - plot.tileX, y - plot.tileY);

const nearestPlotDistance = (x: number, y: number, plots: ReadonlyArray<ForestPlot>) =>
  plots.reduce(
    (closest, plot) => Math.min(closest, distanceTo(x, y, plot)),
    Number.POSITIVE_INFINITY,
  );

function ridgeFor(columns: number, rows: number) {
  const shift = (hashUnit(0, 0, 251) - 0.5) * 10;
  return [
    { x: columns * (0.62 + hashUnit(0, 0, 253) * 0.16) + shift, y: 4 },
    { x: columns * (0.76 + hashUnit(0, 0, 255) * 0.12) + shift, y: rows * 0.24 },
    { x: columns * (0.64 + hashUnit(0, 0, 257) * 0.14) + shift, y: rows * 0.48 },
    { x: columns * (0.8 + hashUnit(0, 0, 259) * 0.12) + shift, y: rows * 0.72 },
    { x: columns * (0.74 + hashUnit(0, 0, 261) * 0.12) + shift, y: rows - 4 },
  ];
}

function mountainBandAt(
  x: number,
  y: number,
  columns: number,
  rows: number,
): 'hill' | 'mountain' | null {
  const ridge = ridgeFor(columns, rows);
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < ridge.length - 1; index++) {
    const from = ridge[index];
    const to = ridge[index + 1];
    if (from && to) {
      distance = Math.min(distance, distanceToSegment(x, y, from, to));
    }
  }
  const breakNoise = valueNoise(x, y, 9, 17);
  const width = 1.5 + valueNoise(x, y, 6, 19) * 2.4;
  if (distance < width && breakNoise > 0.28) {
    return 'mountain';
  }
  if (distance < width + 3.2 && breakNoise > 0.16) {
    return 'hill';
  }
  return null;
}

/**
 * A broken mountain range follows a warped diagonal ridge. A wider hill band
 * makes elevation ramp up visibly before the blocking rock faces; gaps around
 * overlooks and paths become natural passes rather than invisible collision.
 */
function addMountains(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const row = terrain[y];
      if (!row || (row[x] !== 'grass' && row[x] !== 'meadow' && row[x] !== 'wetland')) {
        continue;
      }
      if (nearestPlotDistance(x, y, plots) < PLOT_PROTECT_RADIUS + 0.5) {
        continue;
      }
      const band = mountainBandAt(x, y, columns, rows);
      if (band) {
        row[x] = band;
      }
    }
  }
}

type TrailKind = 'path' | 'trail';

/** Stamps one part of a trail, turning water into a visible bridge or ford. */
function stampTrail(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  x: number,
  y: number,
  kind: TrailKind,
) {
  const width = kind === 'path' ? TRAIL_WIDTH : 1;
  for (let offsetY = 0; offsetY < width; offsetY++) {
    for (let offsetX = 0; offsetX < width; offsetX++) {
      const tileX = x + offsetX;
      const tileY = y + offsetY;
      if (tileX < 1 || tileY < 1 || tileX >= columns - 1 || tileY >= rows - 1) {
        continue;
      }
      const row = terrain[tileY];
      const existing = row?.[tileX];
      if (!row || !existing || existing === 'ocean') {
        continue;
      }
      if (existing === 'lake' || existing === 'shallow') {
        row[tileX] = 'bridge';
      } else {
        row[tileX] = kind;
      }
    }
  }
}

type TrailEdge = { from: number; kind: TrailKind; to: number };

const edgeKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

/**
 * Builds a connected trail graph instead of a conveyor loop. A Prim-style
 * backbone guarantees every landmark is reachable; then each stop gets a
 * second nearest-neighbor connection where possible, creating forks, loops and
 * shortcuts. Main-tree edges are broad paths; optional links are narrow trails.
 */
function buildTrailNetwork(plots: ReadonlyArray<ForestPlot>): Array<TrailEdge> {
  if (plots.length < 2) {
    return [];
  }
  const edges: Array<TrailEdge> = [];
  const connected = new Set([0]);
  const keys = new Set<string>();
  while (connected.size < plots.length) {
    let best: { distance: number; from: number; to: number } | undefined;
    for (const from of connected) {
      const a = plots[from];
      if (!a) {
        continue;
      }
      for (let to = 0; to < plots.length; to++) {
        const b = plots[to];
        if (!b || connected.has(to)) {
          continue;
        }
        const distance = Math.hypot(a.tileX - b.tileX, a.tileY - b.tileY);
        if (!best || distance < best.distance) {
          best = { distance, from, to };
        }
      }
    }
    if (!best) {
      break;
    }
    edges.push({ from: best.from, kind: 'path', to: best.to });
    keys.add(edgeKey(best.from, best.to));
    connected.add(best.to);
  }

  for (let from = 0; from < plots.length; from++) {
    const a = plots[from];
    if (!a) {
      continue;
    }
    const candidate = plots
      .map((b, to) => ({ distance: Math.hypot(a.tileX - b.tileX, a.tileY - b.tileY), to }))
      .filter(({ to }) => to !== from && !keys.has(edgeKey(from, to)))
      .sort((left, right) => left.distance - right.distance)[0];
    if (candidate && candidate.distance < 30) {
      const key = edgeKey(from, candidate.to);
      if (!keys.has(key)) {
        edges.push({ from, kind: 'trail', to: candidate.to });
        keys.add(key);
      }
    }
  }
  return edges;
}

/**
 * Curves one route between landmarks using a deterministic perpendicular bend
 * plus small noise. Water crossed by a route becomes bridge tiles; mountain
 * faces become a visible pass. Collision therefore follows exactly what is
 * drawn instead of using hidden portals.
 *
 * Consecutive samples are joined orthogonally rather than stamped as isolated
 * dots. Rounding a curved route to whole tiles can move both axes at once, and
 * a diagonal hop leaves two tiles touching only at a corner — which the walker
 * cannot pass through, because its foot box would have to overlap the water or
 * rock on either side. Stamped as-is that draws a trail into the lake that
 * stops halfway across, and bridge tiles nothing can ever reach.
 */
function carveRoute(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  from: ForestPlot,
  to: ForestPlot,
  kind: TrailKind,
  salt: number,
) {
  const dx = to.tileX - from.tileX;
  const dy = to.tileY - from.tileY;
  const distance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(distance * 2));
  const bend = (hashUnit(from.tileX, to.tileY, salt) - 0.5) * Math.min(9, distance * 0.3);
  const normalX = distance === 0 ? 0 : -dy / distance;
  const normalY = distance === 0 ? 0 : dx / distance;
  let previousX: number | undefined;
  let previousY: number | undefined;
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const arc = Math.sin(Math.PI * t) * bend;
    const drift = (valueNoise(step, salt, 5, 97) - 0.5) * 1.4;
    const x = Math.round(lerp(from.tileX, to.tileX, t) + normalX * (arc + drift));
    const y = Math.round(lerp(from.tileY, to.tileY, t) + normalY * (arc + drift));
    if (previousX === undefined || previousY === undefined) {
      stampTrail(terrain, columns, rows, x, y, kind);
    } else {
      let walkX = previousX;
      let walkY = previousY;
      while (walkX !== x || walkY !== y) {
        if (walkX !== x) {
          walkX += Math.sign(x - walkX);
        } else {
          walkY += Math.sign(y - walkY);
        }
        stampTrail(terrain, columns, rows, walkX, walkY, kind);
      }
    }
    previousX = x;
    previousY = y;
  }
}

function spanBridges(terrain: Array<Array<TerrainKind>>, columns: number, rows: number) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < columns - 1; x++) {
      const kind = terrain[y]?.[x];
      if (kind !== 'path' && kind !== 'trail') {
        continue;
      }
      for (const [dx, dy] of dirs) {
        const water: Array<{ x: number; y: number }> = [];
        let cx = x + dx;
        let cy = y + dy;
        while (
          water.length < 7 &&
          cx > 0 &&
          cy > 0 &&
          cx < columns - 1 &&
          cy < rows - 1 &&
          (terrain[cy]?.[cx] === 'lake' || terrain[cy]?.[cx] === 'shallow')
        ) {
          water.push({ x: cx, y: cy });
          cx += dx;
          cy += dy;
        }
        const land = terrain[cy]?.[cx];
        if (
          water.length >= 1 &&
          land &&
          land !== 'ocean' &&
          land !== 'mountain' &&
          land !== 'lake' &&
          land !== 'shallow'
        ) {
          for (const tile of water) {
            const row = terrain[tile.y];
            if (row) {
              row[tile.x] = 'bridge';
            }
          }
        }
      }
    }
  }
}

function carveTrails(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
) {
  for (const [index, edge] of buildTrailNetwork(plots).entries()) {
    const from = plots[edge.from];
    const to = plots[edge.to];
    if (from && to) {
      carveRoute(terrain, columns, rows, from, to, edge.kind, 101 + index);
    }
  }
  spanBridges(terrain, columns, rows);
}

/**
 * Opens a soft-edged glade at the foot of each landmark, so a board has mown
 * ground to stand on and the trail through it reads as a stop rather than a
 * thicket.
 *
 * Deliberately only the glade. Mowing the board's whole reserved footprint
 * flattens roughly half the island — the boards are eight tiles tall — and
 * leaves nowhere for the forest to actually be. The board is opaque and paints
 * over whatever grows behind it, so the ground it covers does not need clearing;
 * what must be guaranteed is that nothing is *scattered* there, which
 * `isReservedGround` handles structurally.
 */
function openClearings(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
) {
  for (const plot of plots) {
    const minY = Math.max(1, Math.floor(plot.tileY - CLEARING_RADIUS - 1));
    const maxY = Math.min(rows - 2, Math.ceil(plot.tileY + CLEARING_RADIUS + 1));
    const minX = Math.max(1, Math.floor(plot.tileX - CLEARING_RADIUS - 1));
    const maxX = Math.min(columns - 2, Math.ceil(plot.tileX + CLEARING_RADIUS + 1));
    for (let y = minY; y <= maxY; y++) {
      const row = terrain[y];
      if (!row) {
        continue;
      }
      for (let x = minX; x <= maxX; x++) {
        const edge = CLEARING_RADIUS + valueNoise(x, y, 4, 29) * 1.2;
        if (distanceTo(x, y, plot) <= edge && row[x] !== 'ocean') {
          row[x] = 'clearing';
        }
      }
    }
  }
}

/**
 * The rectangle a board covers, in tiles. Nothing is scattered here at all — a
 * tree planted at the top of the footprint would grow out past the plaque's top
 * edge, since sprites stand nearly two tiles tall. This is the scenery half of
 * the same footprint the layout uses to keep boards from overlapping each other.
 */
function isUnderBoard(x: number, y: number, plots: ReadonlyArray<ForestPlot>): boolean {
  return plots.some((plot) => {
    const rect = landmarkTileRect(plot);
    // Extra tile of padding only to the north: sprites stand ~two tiles tall, so a
    // tree planted on the plaque's top edge would grow out through the nameplate.
    // East, west and south stay tight so grove trees can overlap the posts.
    return x >= rect.minX && x <= rect.maxX && y >= rect.minY - 1 && y <= rect.maxY;
  });
}

/**
 * True where a tree or rock would stand between the walker and a sign. Flowers
 * are welcome in a glade; anything solid is not.
 */
function blocksApproach(x: number, y: number, plots: ReadonlyArray<ForestPlot>): boolean {
  return nearestPlotDistance(x, y, plots) <= SCENERY_CLEAR_RADIUS;
}

function hasNeighbour(
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  x: number,
  y: number,
  kinds: ReadonlySet<TerrainKind>,
): boolean {
  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      const kind = terrain[y + offsetY]?.[x + offsetX];
      if (kind && kinds.has(kind)) {
        return true;
      }
    }
  }
  return false;
}

const TRAIL_ADJACENT: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'bridge',
  'clearing',
  'path',
  'trail',
]);

const WATER_KINDS: ReadonlySet<TerrainKind> = new Set<TerrainKind>(['lake', 'shallow', 'wetland']);

const PLANTABLE: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'clearing',
  'grass',
  'hill',
  'meadow',
  'sand',
]);

function pickTreeKind(
  x: number,
  y: number,
  kind: TerrainKind,
  density: number,
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
): SceneryKind {
  if (hasNeighbour(terrain, x, y, WATER_KINDS) && hashUnit(x, y, 47) < 0.62) {
    return 'willow';
  }
  if (kind === 'hill' || density > 0.7) {
    return hashUnit(x, y, 48) > 0.5 ? 'cedar' : 'pine';
  }
  if (kind === 'meadow' && hashUnit(x, y, 46) < 0.32) {
    return 'bush';
  }
  if (hashUnit(x, y, 49) > 0.92) {
    return 'dead';
  }
  if (hashUnit(x, y, 50) > 0.84) {
    return 'fruit';
  }
  const mix = hashUnit(x, y, 51);
  if (mix > 0.74) {
    return 'maple';
  }
  if (mix > 0.5) {
    return 'birch';
  }
  if (mix > 0.26) {
    return 'oak';
  }
  return hashUnit(x, y, 54) > 0.45 ? 'pine' : 'oak';
}

function spriteScale(x: number, y: number, density = 0.5): number {
  if (density > 0.62) {
    return 0.58 + hashUnit(x, y, 52) * 0.38;
  }
  if (density < 0.4) {
    return 1.12 + hashUnit(x, y, 52) * 0.36;
  }
  return 0.78 + hashUnit(x, y, 52) * 0.48;
}

/**
 * Scatters trees and detail. Density comes from clumped noise so the forest has
 * thickets and glades instead of an even sprinkle.
 */
function scatterScenery(
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
): Array<ScenerySprite> {
  const scenery: Array<ScenerySprite> = [];
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < columns - 1; x++) {
      const kind = terrain[y]?.[x];
      if (!kind || isUnderBoard(x, y, plots)) {
        continue;
      }
      const roll = hashUnit(x, y, 41);
      const mayPlantSolid = !blocksApproach(x, y, plots);
      if (kind === 'sand') {
        if (roll > 0.965) {
          if (mayPlantSolid) {
            scenery.push({ kind: 'rock', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
          }
        } else if (roll < 0.02) {
          scenery.push({ kind: 'reed', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
        }
        continue;
      }
      if (kind === 'clearing') {
        if (roll > 0.93 && nearestPlotDistance(x, y, plots) > CLEARING_RADIUS - 1.5) {
          scenery.push({ kind: 'bloom', scale: spriteScale(x, y, 0.3), tileX: x, tileY: y });
        }
        continue;
      }
      if (kind === 'wetland') {
        if (roll < 0.34) {
          scenery.push({ kind: 'reed', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
        } else if (roll > 0.96) {
          scenery.push({ kind: 'bloom', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
        }
        continue;
      }
      if (kind === 'hill') {
        if (mayPlantSolid && roll < 0.18) {
          scenery.push({
            kind: roll < 0.1 ? 'cedar' : 'rock',
            scale: spriteScale(x, y, 0.7),
            tileX: x,
            tileY: y,
          });
        }
        continue;
      }
      if (kind !== 'grass' && kind !== 'meadow') {
        continue;
      }
      const nextToTrail = hasNeighbour(terrain, x, y, TRAIL_ADJACENT);
      if (nextToTrail) {
        if (roll > 0.9) {
          scenery.push({
            kind: roll > 0.97 ? 'log' : roll > 0.96 ? 'stump' : 'bloom',
            scale: spriteScale(x, y, 0.4),
            tileX: x,
            tileY: y,
          });
        }
        continue;
      }
      if (!mayPlantSolid) {
        continue;
      }
      const density = valueNoise(x, y, 7, 53) * 0.65 + valueNoise(x, y, 18, 59) * 0.35;
      const treeThreshold =
        kind === 'grass'
          ? density > 0.62
            ? 0.48
            : density > 0.48
              ? 0.22
              : 0.06
          : density > 0.72
            ? 0.08
            : 0.015;
      if (roll < treeThreshold) {
        scenery.push({
          kind: pickTreeKind(x, y, kind, density, terrain),
          scale: spriteScale(x, y, density),
          tileX: x,
          tileY: y,
        });
      } else if (kind === 'meadow' && roll > 0.82 && roll < 0.9) {
        scenery.push({ kind: 'bush', scale: spriteScale(x, y, 0.7), tileX: x, tileY: y });
      } else if (roll > 0.972) {
        scenery.push({ kind: 'rock', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
      } else if (kind === 'meadow' && roll > 0.9) {
        scenery.push({ kind: 'bloom', scale: spriteScale(x, y, 0.35), tileX: x, tileY: y });
      }
    }
  }
  return scenery;
}

const GROVE_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-2, 1],
  [2, 1],
  [-3, 1],
  [3, 1],
  [-1, 1],
  [1, 1],
  [0, 1],
  [-2, 2],
  [2, 2],
  [-3, 2],
  [3, 2],
  [-1, 2],
  [1, 2],
  [0, 2],
  [-4, 1],
  [4, 1],
  [-6, 2],
  [6, 2],
  [-2, 3],
  [2, 3],
  [-4, 3],
  [4, 3],
  [0, 3],
  [-1, 4],
  [1, 4],
  [-3, 4],
  [3, 4],
  [-5, 0],
  [5, 0],
  [-4, -1],
  [4, -1],
  [-6, -2],
  [6, -2],
  [-5, -3],
  [5, -3],
  [-3, -10],
  [3, -10],
  [0, -10],
];

function fitSouthGroveScale(offsetY: number, kind: SceneryKind, x: number, y: number): number {
  const feetSouth = offsetY * TILE_SIZE + TILE_SIZE / 2;
  const tiles = STAMP_TILES[kind].height;
  const desired = spriteScale(x, y, kind === 'bush' ? 0.48 : 0.7);
  const maxScale = (feetSouth + SOUTH_GROVE_MAX_OVERHANG_PX) / (TILE_SIZE * tiles);
  return Math.max(0.4, Math.min(desired, maxScale));
}

/**
 * Scatter can plant a full-size pine on the approach after the grove pass.
 * Shrink any stamp whose canopy would cover the photograph or nameplate.
 */
function trimSouthCanopies(plots: ReadonlyArray<ForestPlot>, scenery: Array<ScenerySprite>) {
  const contentHalf = LANDMARK_CONTENT_WIDTH_PX / 2;
  for (const sprite of scenery) {
    for (const plot of plots) {
      const offsetY = sprite.tileY - plot.tileY;
      const offsetX = sprite.tileX - plot.tileX;
      if (offsetY < 1 || offsetY > 5 || Math.abs(offsetX) > 6) {
        continue;
      }
      if (offsetY <= 2 && Math.abs(offsetX) <= 3 && TREE_KINDS.has(sprite.kind)) {
        sprite.kind = 'bush';
        sprite.scale = fitSouthGroveScale(offsetY, 'bush', sprite.tileX, sprite.tileY);
      }
      const metrics = STAMP_TILES[sprite.kind];
      const feetSouth = offsetY * TILE_SIZE + TILE_SIZE / 2;
      const halfWidth = (TILE_SIZE * metrics.width * sprite.scale) / 2;
      const overlapsContentX = Math.abs(offsetX * TILE_SIZE) - halfWidth < contentHalf;
      if (!overlapsContentX) {
        continue;
      }
      const maxScale = (feetSouth + SOUTH_GROVE_MAX_OVERHANG_PX) / (TILE_SIZE * metrics.height);
      if (sprite.scale > maxScale) {
        sprite.scale = Math.max(0.35, maxScale);
      }
    }
  }
}

/**
 * Plants a handful of trees just outside each footprint so boards sit in a
 * grove. South-side stamps use `layerZ` to paint in front of the posts and the
 * lower wood — never the photograph, body text, or nameplate. The column in
 * front of the content box stays bushes.
 */
function plantGroveSentinels(
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
  scenery: Array<ScenerySprite>,
) {
  const occupied = new Set(scenery.map((sprite) => `${sprite.tileX},${sprite.tileY}`));
  for (const plot of plots) {
    for (const [offsetX, offsetY] of GROVE_OFFSETS) {
      const x = plot.tileX + offsetX;
      const y = plot.tileY + offsetY;
      if (x < 1 || y < 1 || x >= columns - 1 || y >= rows - 1) {
        continue;
      }
      if (isUnderBoard(x, y, plots) || occupied.has(`${x},${y}`)) {
        continue;
      }
      const southGrove = offsetY >= 1;
      if (
        !southGrove &&
        plots.some((other) => Math.abs(other.tileX - x) <= 2 && Math.abs(other.tileY - y) <= 2)
      ) {
        continue;
      }
      const kind = terrain[y]?.[x];
      const trailGrass = southGrove && Math.abs(offsetX) <= 1 && offsetY <= 2;
      if (!kind || kind === 'ocean' || kind === 'lake' || kind === 'shallow') {
        continue;
      }
      const southPlantable =
        kind === 'clearing' ||
        kind === 'meadow' ||
        kind === 'grass' ||
        kind === 'path' ||
        kind === 'trail';
      if (
        !trailGrass &&
        !(PLANTABLE.has(kind) || kind === 'wetland' || (southGrove && southPlantable))
      ) {
        continue;
      }
      occupied.add(`${x},${y}`);
      const frontOfBoard = southGrove && offsetY <= 2 && Math.abs(offsetX) <= 3;
      const sentinelKind =
        trailGrass || frontOfBoard ? 'bush' : pickTreeKind(x, y, kind, 0.65, terrain);
      scenery.push({
        ...(southGrove ? { blocks: false } : {}),
        kind: sentinelKind,
        scale: southGrove
          ? fitSouthGroveScale(offsetY, sentinelKind, x, y)
          : spriteScale(x, y, 0.32),
        tileX: x,
        tileY: y,
      });
    }
  }
}

const MAX_CRITTERS = 12;

const HOPPERS: ReadonlyArray<CritterKind> = ['deer', 'fox', 'rabbit'];

/**
 * A few looping animals, placed from the same seed as the trees. They never
 * sit on a board or on water the walker cannot cross.
 */
function placeCritters(
  terrain: ReadonlyArray<ReadonlyArray<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
): Array<ForestCritter> {
  const critters: Array<ForestCritter> = [];
  for (let y = 2; y < rows - 2 && critters.length < MAX_CRITTERS; y++) {
    for (let x = 2; x < columns - 2 && critters.length < MAX_CRITTERS; x++) {
      if (isUnderBoard(x, y, plots) || blocksApproach(x, y, plots)) {
        continue;
      }
      const kind = terrain[y]?.[x];
      const roll = hashUnit(x, y, 61);
      if (kind === 'lake' && roll > 0.984) {
        critters.push({
          delayMs: Math.floor(hashUnit(x, y, 63) * 4000),
          kind: 'fish',
          tileX: x,
          tileY: y,
        });
        continue;
      }
      if ((kind === 'grass' || kind === 'meadow' || kind === 'clearing') && roll > 0.991) {
        const hopper = HOPPERS[Math.floor(hashUnit(x, y, 67) * HOPPERS.length)] ?? 'rabbit';
        critters.push({
          delayMs: Math.floor(hashUnit(x, y, 69) * 3500),
          kind: hopper,
          tileX: x,
          tileY: y,
        });
        continue;
      }
      if (kind === 'grass' && roll > 0.988 && roll <= 0.991) {
        critters.push({
          delayMs: Math.floor(hashUnit(x, y, 71) * 6000),
          kind: 'bird',
          tileX: x,
          tileY: y,
        });
      }
    }
  }
  return critters;
}

/** Walks outward in rings until it finds somewhere the character can stand. */
function findNearestWalkable(
  world: WalkableWorld,
  tileX: number,
  tileY: number,
): { tileX: number; tileY: number } {
  for (let radius = 0; radius < 12; radius++) {
    for (let offsetY = -radius; offsetY <= radius; offsetY++) {
      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        const x = tileX + offsetX;
        const y = tileY + offsetY;
        if (isWalkableTile(world, x, y)) {
          return { tileX: x, tileY: y };
        }
      }
    }
  }
  return { tileX, tileY };
}

type WalkableWorld = Pick<ForestWorld, 'columns' | 'rows' | 'terrain'>;

/** True when the terrain on this tile can be stood on, ignoring scenery. */
export function isWalkableTile(world: WalkableWorld, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= world.columns || tileY >= world.rows) {
    return false;
  }
  const kind = world.terrain[tileY]?.[tileX];
  return kind !== undefined && WALKABLE_TERRAIN.has(kind);
}

/**
 * Builds the island around an ordered list of card ids. Terrain is generated
 * first from `seed`, then cards are slotted into valid clearings. The same seed
 * always yields the same island, so SSR markup and hydration match.
 */
export function buildForestWorld(
  plotIds: ReadonlyArray<string>,
  seed = DEFAULT_FOREST_SEED,
): ForestWorld {
  const previous = activeSeed;
  activeSeed = seed >>> 0 || 1;
  try {
    const columns = WORLD_COLUMNS;
    const rows = MIN_WORLD_ROWS;
    const terrain: Array<Array<TerrainKind>> = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: columns }, (__, x) => baseTerrainAt(x, y, columns, rows)),
    );

    addMountains(terrain, columns, rows, []);
    const plots = layOutPlots(plotIds, terrain, columns, rows);
    openClearings(terrain, columns, rows, plots);
    carveTrails(terrain, columns, rows, plots);
    const scenery = scatterScenery(terrain, columns, rows, plots);
    plantGroveSentinels(terrain, columns, rows, plots, scenery);
    trimSouthCanopies(plots, scenery);
    const critters = placeCritters(terrain, columns, rows, plots);

    const firstPlot = plots[0];
    const spawn = findNearestWalkable(
      { columns, rows, terrain },
      firstPlot ? firstPlot.tileX : Math.floor(columns / 2),
      firstPlot ? firstPlot.tileY : Math.floor(rows / 2),
    );

    return { columns, critters, plots, rows, scenery, seed: activeSeed, spawn, terrain };
  } finally {
    activeSeed = previous;
  }
}

/**
 * Smooth FBM for the ground painter. Many octaves, small amplitude — a
 * punchy lattice aliases into the light-green checker. Collision stays on
 * the 48px grid; this is only what you see.
 */
export function sampleGroundGrainUnlocked(fx: number, fy: number) {
  const warpX = fx + (perlinNoise(fx, fy, 9.4, 521) - 0.5) * 2.4;
  const warpY = fy + (perlinNoise(fx, fy, 8.1, 523) - 0.5) * 2.4;
  let amplitude = 1.7;
  let scale = 6.8;
  let grain = 0;
  for (let octave = 0; octave < 5; octave++) {
    grain += (perlinNoise(warpX, warpY, scale, 501 + octave * 19) - 0.5) * amplitude;
    amplitude *= 0.52;
    scale *= 0.5;
  }
  return grain;
}

export function sampleGroundGrain(world: Pick<ForestWorld, 'seed'>, fx: number, fy: number) {
  return withWorldSeed(world.seed, () => sampleGroundGrainUnlocked(fx, fy));
}

/**
 * Continuous fields at a fractional coordinate. No biome classification —
 * the painter lerps colours from these numbers so coasts blend.
 */
export function sampleTerrainFieldsUnlocked(
  world: Pick<ForestWorld, 'columns' | 'rows'>,
  fx: number,
  fy: number,
): TerrainFields {
  return terrainFieldsAt(fx, fy, world.columns, world.rows, true);
}

export function sampleTerrainFields(world: ForestWorld, fx: number, fy: number): TerrainFields {
  return withWorldSeed(world.seed, () => sampleTerrainFieldsUnlocked(world, fx, fy));
}

export type VisualTerrainSample = {
  fields: TerrainFields | null;
  kind: TerrainKind;
  route: boolean;
};

/**
 * Same sample the bitmap painter uses. Routes stay snapped to the collision
 * grid. Everything else re-evaluates the distance field at a warped
 * fractional coordinate so the PNG can lerp a coast instead of a stair.
 */
export function visualTerrainSample(
  world: ForestWorld,
  fx: number,
  fy: number,
): VisualTerrainSample {
  const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
  const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
  const discrete = world.terrain[tileY]?.[tileX] ?? 'ocean';
  if (ROUTE_KINDS.has(discrete)) {
    return { fields: null, kind: discrete, route: true };
  }
  const previous = activeSeed;
  activeSeed = world.seed;
  try {
    const jx =
      (valueNoise(fx, fy, 1.2, 311) - 0.5) * 2.15 + (valueNoise(fx, fy, 2.6, 317) - 0.5) * 0.9;
    const jy =
      (valueNoise(fx, fy, 1.3, 313) - 0.5) * 2.15 + (valueNoise(fx, fy, 2.8, 319) - 0.5) * 0.9;
    const sx = fx + jx;
    const sy = fy + jy;
    const fields = terrainFieldsAt(sx, sy, world.columns, world.rows, true);
    let kind = classifyTerrain(fields);
    if (kind === 'grass' || kind === 'meadow' || kind === 'wetland') {
      const band = mountainBandAt(sx, sy, world.columns, world.rows);
      if (band && nearestPlotDistance(sx, sy, world.plots) >= PLOT_PROTECT_RADIUS + 0.5) {
        kind = band;
      }
    }
    return { fields, kind, route: false };
  } finally {
    activeSeed = previous;
  }
}

export function visualTerrainAt(world: ForestWorld, fx: number, fy: number): TerrainKind {
  return visualTerrainSample(world, fx, fy).kind;
}

/** Collapses one row of values into `{ start, length, value }` spans. */
function runLengthEncode<T>(row: ReadonlyArray<T>) {
  const spans: Array<{ length: number; start: number; value: T }> = [];
  let start = 0;
  for (let x = 1; x <= row.length; x++) {
    if (x < row.length && row[x] === row[start]) {
      continue;
    }
    const value = row[start];
    if (value !== undefined) {
      spans.push({ length: x - start, start, value });
    }
    start = x;
  }
  return spans;
}

/**
 * Collapses each terrain row into horizontal runs. A 72x52 map drops from ~3700
 * rects to a few hundred, which keeps the server-rendered SVG light.
 */
export function toTerrainRuns(world: Pick<ForestWorld, 'rows' | 'terrain'>): Array<TerrainRun> {
  const runs: Array<TerrainRun> = [];
  for (let y = 0; y < world.rows; y++) {
    const row = world.terrain[y];
    if (!row) {
      continue;
    }
    for (const span of runLengthEncode(row)) {
      runs.push({ kind: span.value, length: span.length, tileX: span.start, tileY: y });
    }
  }
  return runs;
}

export type MinimapKind =
  | 'bridge'
  | 'clearing'
  | 'forest'
  | 'hill'
  | 'meadow'
  | 'peak'
  | 'side-trail'
  | 'trail'
  | 'water'
  | 'wetland';

const MINIMAP_KIND: Record<TerrainKind, MinimapKind> = {
  bridge: 'bridge',
  clearing: 'clearing',
  grass: 'forest',
  hill: 'hill',
  lake: 'water',
  meadow: 'meadow',
  mountain: 'peak',
  ocean: 'water',
  path: 'trail',
  sand: 'meadow',
  shallow: 'water',
  trail: 'side-trail',
  wetland: 'wetland',
};

/**
 * The same world reduced to biome and route colours. Main paths, side trails,
 * bridges, water, elevation and vegetation remain distinct so the larger world
 * is legible without turning the minimap into a tiny screenshot.
 */
export function toMinimapRuns(world: Pick<ForestWorld, 'rows' | 'terrain'>) {
  const runs: Array<{ kind: MinimapKind; length: number; tileX: number; tileY: number }> = [];
  for (let y = 0; y < world.rows; y++) {
    const row = world.terrain[y];
    if (!row) {
      continue;
    }
    for (const span of runLengthEncode(row.map((kind) => MINIMAP_KIND[kind]))) {
      runs.push({ kind: span.value, length: span.length, tileX: span.start, tileY: y });
    }
  }
  return runs;
}

export type PixelRect = { height: number; left: number; top: number; width: number };

/**
 * The pixel rectangle every landmark reserves on the world plane. Boards clamp
 * themselves to these, so this is what the overlap tests measure against: no two
 * may intersect, and none may fall outside the island.
 */
export function landmarkRects(
  world: Pick<ForestWorld, 'plots'>,
): Array<PixelRect & { id: string }> {
  return world.plots.map((plot) => {
    const rect = landmarkTileRect(plot);
    return {
      height: (rect.maxY - rect.minY) * TILE_SIZE,
      id: plot.id,
      left: rect.minX * TILE_SIZE,
      top: rect.minY * TILE_SIZE,
      width: (rect.maxX - rect.minX) * TILE_SIZE,
    };
  });
}

/** True when two rectangles share any area. */
export function rectsOverlap(a: PixelRect, b: PixelRect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/**
 * Serialises collision into one string per row of `0`/`1`. This is the only
 * piece of the world the client component needs.
 */
export function toBlockedMask(world: ForestWorld): Array<string> {
  const blocked = new Set(
    world.scenery
      .filter((sprite) => sprite.blocks !== false && BLOCKING_SCENERY.has(sprite.kind))
      .map((sprite) => `${sprite.tileX},${sprite.tileY}`),
  );
  return Array.from({ length: world.rows }, (_, y) =>
    Array.from({ length: world.columns }, (__, x) =>
      isWalkableTile(world, x, y) && !blocked.has(`${x},${y}`) ? '0' : '1',
    ).join(''),
  );
}
