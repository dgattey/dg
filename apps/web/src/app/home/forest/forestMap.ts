/**
 * Deterministic island generator. Pure so SSR markup matches hydration.
 * The client only receives the blocked-tile mask.
 */

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

export type SceneryKind = 'birch' | 'bloom' | 'bush' | 'oak' | 'pine' | 'reed' | 'rock' | 'willow';

export type ScenerySprite = {
  kind: SceneryKind;
  scale: number;
  tileX: number;
  tileY: number;
};

export type CritterKind = 'bird' | 'rabbit';

export type ForestCritter = {
  delayMs: number;
  kind: CritterKind;
  tileX: number;
  tileY: number;
};

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

export type PixelRect = { height: number; left: number; top: number; width: number };

export const FOOTPRINT_WIDTH = 7;
export const FOOTPRINT_NORTH = 8;
export const LANDMARK_CONTENT_WIDTH_PX = (FOOTPRINT_WIDTH - 0.5) * TILE_SIZE;
const LANDMARK_CHROME_BUDGET_PX = 84;
export const LANDMARK_MAX_HEIGHT_PX = FOOTPRINT_NORTH * TILE_SIZE - LANDMARK_CHROME_BUDGET_PX;

const STAMP_TILES: Record<SceneryKind, { height: number; width: number }> = {
  birch: { height: 3.15, width: 1.8 },
  bloom: { height: 0.85, width: 0.85 },
  bush: { height: 1.25, width: 1.9 },
  oak: { height: 3, width: 2.65 },
  pine: { height: 3.5, width: 2.05 },
  reed: { height: 1.55, width: 1.05 },
  rock: { height: 1, width: 1.35 },
  willow: { height: 2.85, width: 3 },
};

const WORLD_COLUMNS = 62;
const MIN_WORLD_ROWS = 86;
const PLOT_PROTECT_RADIUS = 4.6;
const CLEARING_RADIUS = 2.7;
const SCENERY_CLEAR_RADIUS = 3.2;
const TRAIL_WIDTH = 2;

export const DEFAULT_FOREST_SEED = 20_260_812;

let activeSeed = DEFAULT_FOREST_SEED;

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
  'oak',
  'pine',
  'willow',
]);

const BLOCKING_SCENERY: ReadonlySet<SceneryKind> = new Set<SceneryKind>([...TREE_KINDS, 'rock']);

export const layerZ = (tileY: number) => tileY + 1;

export const MINIMAP_MARKER_ROLE = 'forest-minimap-marker';

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

function terrainFieldsAt(x: number, y: number, columns: number, rows: number): TerrainFields {
  const warpX = (valueNoise(x, y, 11, 71) - 0.5) * 4.2;
  const warpY = (valueNoise(x, y, 13, 73) - 0.5) * 4.2;
  const centreX = (columns - 1) / 2 + (hashUnit(0, 0, 201) - 0.5) * 3;
  const centreY = (rows - 1) / 2 + (hashUnit(0, 0, 203) - 0.5) * 4;
  const radiusX = columns * (0.46 + hashUnit(0, 0, 205) * 0.04);
  const radiusY = rows * (0.47 + hashUnit(0, 0, 207) * 0.04);
  const island =
    Math.hypot((x + warpX - centreX) / radiusX, (y + warpY - centreY) / radiusY) +
    (valueNoise(x, y, 8, 3) - 0.5) * 0.12 +
    (valueNoise(x, y, 19, 5) - 0.5) * 0.08;

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
  const lakeField = Math.min(lakeMain, lakeCove, pond);
  const river = riverDistance(x + warpX * 0.35, y + warpY * 0.35, rows);
  const riverWidth = 1.05 + valueNoise(x, y, 7, 83) * 0.9;
  const meadowNoise = valueNoise(x, y, 12, 11) * 0.55 + valueNoise(x, y, 25, 13) * 0.45;
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

function baseTerrainAt(x: number, y: number, columns: number, rows: number): TerrainKind {
  return classifyTerrain(terrainFieldsAt(x, y, columns, rows));
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
      row[tileX] = existing === 'lake' || existing === 'shallow' ? 'bridge' : kind;
    }
  }
}

type TrailEdge = { from: number; kind: TrailKind; to: number };

const edgeKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

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

function isUnderBoard(x: number, y: number, plots: ReadonlyArray<ForestPlot>): boolean {
  return plots.some((plot) => {
    const rect = landmarkTileRect(plot);
    return x >= rect.minX && x <= rect.maxX && y >= rect.minY - 1 && y <= rect.maxY;
  });
}

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
    return 'pine';
  }
  if (kind === 'meadow' && hashUnit(x, y, 46) < 0.32) {
    return 'bush';
  }
  const mix = hashUnit(x, y, 51);
  if (mix > 0.62) {
    return 'birch';
  }
  if (mix > 0.28) {
    return 'oak';
  }
  return 'pine';
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
        if (roll > 0.965 && mayPlantSolid) {
          scenery.push({ kind: 'rock', scale: spriteScale(x, y, 0.5), tileX: x, tileY: y });
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
            kind: roll < 0.1 ? 'pine' : 'rock',
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
      if (hasNeighbour(terrain, x, y, TRAIL_ADJACENT)) {
        if (roll > 0.9) {
          scenery.push({
            kind: roll > 0.96 ? 'rock' : 'bloom',
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

const LANDMARK_FRAME_PAD_PX = 6;
const LANDMARK_FRAME_CHROME_PX = 66;
const LANDMARK_STACK_LAYOUT_PX = 142;

export function landmarkContentRect(plot: ForestPlot): PixelRect {
  const anchorX = plot.tileX * TILE_SIZE + TILE_SIZE / 2;
  const anchorY = plot.tileY * TILE_SIZE + TILE_SIZE / 2;
  const width = LANDMARK_CONTENT_WIDTH_PX + LANDMARK_FRAME_PAD_PX * 2;
  return {
    height: LANDMARK_MAX_HEIGHT_PX + LANDMARK_FRAME_CHROME_PX,
    left: anchorX - width / 2,
    top: anchorY - LANDMARK_STACK_LAYOUT_PX,
    width,
  };
}

export function sceneryStampRect(sprite: ScenerySprite): PixelRect {
  const metrics = STAMP_TILES[sprite.kind];
  const width = TILE_SIZE * metrics.width * sprite.scale;
  const height = TILE_SIZE * metrics.height * sprite.scale;
  return {
    height,
    left: sprite.tileX * TILE_SIZE - (width - TILE_SIZE) / 2,
    top: (sprite.tileY + 1) * TILE_SIZE - height,
    width,
  };
}

function dropContentOverlaps(plots: ReadonlyArray<ForestPlot>, scenery: Array<ScenerySprite>) {
  const contents = plots.map(landmarkContentRect);
  let write = 0;
  for (const sprite of scenery) {
    if (contents.some((content) => rectsOverlap(sceneryStampRect(sprite), content))) {
      continue;
    }
    scenery[write] = sprite;
    write += 1;
  }
  scenery.length = write;
}

const MAX_CRITTERS = 6;

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
      if ((kind === 'grass' || kind === 'meadow' || kind === 'clearing') && roll > 0.991) {
        critters.push({
          delayMs: Math.floor(hashUnit(x, y, 69) * 3500),
          kind: 'rabbit',
          tileX: x,
          tileY: y,
        });
      } else if (kind === 'grass' && roll > 0.988 && roll <= 0.991) {
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

export function isWalkableTile(world: WalkableWorld, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= world.columns || tileY >= world.rows) {
    return false;
  }
  const kind = world.terrain[tileY]?.[tileX];
  return kind !== undefined && WALKABLE_TERRAIN.has(kind);
}

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
    dropContentOverlaps(plots, scenery);
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

export function sampleGroundGrainUnlocked(fx: number, fy: number) {
  return (valueNoise(fx, fy, 6.8, 501) - 0.5) * 1.7 + (valueNoise(fx, fy, 3.4, 520) - 0.5) * 0.9;
}

export function sampleGroundGrain(world: Pick<ForestWorld, 'seed'>, fx: number, fy: number) {
  return withWorldSeed(world.seed, () => sampleGroundGrainUnlocked(fx, fy));
}

export function sampleTerrainFieldsUnlocked(
  world: Pick<ForestWorld, 'columns' | 'rows'>,
  fx: number,
  fy: number,
): TerrainFields {
  return terrainFieldsAt(fx, fy, world.columns, world.rows);
}

export function visualTerrainAt(world: ForestWorld, fx: number, fy: number): TerrainKind {
  const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
  const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
  const discrete = world.terrain[tileY]?.[tileX] ?? 'ocean';
  if (ROUTE_KINDS.has(discrete)) {
    return discrete;
  }
  return withWorldSeed(world.seed, () => {
    const sx = fx + (valueNoise(fx, fy, 1.2, 311) - 0.5) * 2.15;
    const sy = fy + (valueNoise(fx, fy, 1.3, 313) - 0.5) * 2.15;
    let kind = classifyTerrain(terrainFieldsAt(sx, sy, world.columns, world.rows));
    if (kind === 'grass' || kind === 'meadow' || kind === 'wetland') {
      const band = mountainBandAt(sx, sy, world.columns, world.rows);
      if (band && nearestPlotDistance(sx, sy, world.plots) >= PLOT_PROTECT_RADIUS + 0.5) {
        kind = band;
      }
    }
    return kind;
  });
}

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

export function rectsOverlap(a: PixelRect, b: PixelRect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

export function toBlockedMask(world: ForestWorld): Array<string> {
  const blocked = new Set(
    world.scenery
      .filter((sprite) => BLOCKING_SCENERY.has(sprite.kind))
      .map((sprite) => `${sprite.tileX},${sprite.tileY}`),
  );
  return Array.from({ length: world.rows }, (_, y) =>
    Array.from({ length: world.columns }, (__, x) =>
      isWalkableTile(world, x, y) && !blocked.has(`${x},${y}`) ? '0' : '1',
    ).join(''),
  );
}
