/**
 * Deterministic generator for the walkable forest island.
 *
 * Everything here is pure so the whole landscape can be built during the server
 * render and shipped as markup. The client only ever receives the blocked-tile
 * mask, which is all the walker needs to stop people wading into the ocean.
 */

/** Pixel size of one map tile. Small enough to look blocky, big enough to walk. */
export const TILE_SIZE = 48;

export type TerrainKind =
  | 'clearing'
  | 'grass'
  | 'meadow'
  | 'mountain'
  | 'ocean'
  | 'path'
  | 'sand'
  | 'shallow';

export type SceneryKind = 'bloom' | 'oak' | 'pine' | 'reed' | 'rock' | 'stump';

export type ScenerySprite = {
  kind: SceneryKind;
  tileX: number;
  tileY: number;
};

/** A cleared spot in the forest that one homepage card is planted on. */
export type ForestPlot = {
  id: string;
  tileX: number;
  tileY: number;
};

export type ForestWorld = {
  columns: number;
  plots: Array<ForestPlot>;
  rows: number;
  scenery: Array<ScenerySprite>;
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
 * Plot geometry, in tiles. A cell has to hold a `gridItemDimension` card (17.25rem
 * ≈ 5.75 tiles) plus its sign, with enough forest left over between clearings
 * that the trail reads as a walk rather than a lawn.
 */
const PLOT_COLUMNS = 4;
const PLOT_CELL_WIDTH = 15;
const PLOT_CELL_HEIGHT = 14;
const EDGE_MARGIN_X = 6;
const EDGE_MARGIN_Y = 5;

/** Tiles around a plot centre that stay clear of trees, rocks and peaks. */
const PLOT_PROTECT_RADIUS = 4.6;
const CLEARING_RADIUS = 2.7;

/** Trail width in tiles. Two is wide enough to walk, narrow enough to read as a path. */
const TRAIL_WIDTH = 2;

const SEED = 20_260_812;

const WALKABLE_TERRAIN: ReadonlySet<TerrainKind> = new Set<TerrainKind>([
  'clearing',
  'grass',
  'meadow',
  'path',
  'sand',
]);

const BLOCKING_SCENERY: ReadonlySet<SceneryKind> = new Set<SceneryKind>(['oak', 'pine', 'rock']);

/** Stable 0..1 hash. Nothing random reaches the client, so SSR and hydration agree. */
function hashUnit(x: number, y: number, salt: number): number {
  let h =
    Math.imul(x + 0x1f1f, 0x27d4_eb2d) ^
    Math.imul(y + 0x9e37, 0x1656_67b1) ^
    Math.imul(salt + SEED, 0x2545_f491);
  h = Math.imul(h ^ (h >>> 15), 0x85eb_ca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2_ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 0x1_0000_0000;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Bilinear value noise — enough shape for coastlines and tree clumps. */
function valueNoise(x: number, y: number, scale: number, salt: number): number {
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

/**
 * Lays plots out in a serpentine so the trail between them reads as one walk
 * rather than a grid, with a tile of jitter to break up the rows.
 */
function layOutPlots(ids: ReadonlyArray<string>): Array<ForestPlot> {
  return ids.map((id, index) => {
    const row = Math.floor(index / PLOT_COLUMNS);
    const indexInRow = index % PLOT_COLUMNS;
    const column = row % 2 === 0 ? indexInRow : PLOT_COLUMNS - 1 - indexInRow;
    const jitterX = Math.round(hashUnit(index, 1, 7) * 2) - 1;
    const jitterY = Math.round(hashUnit(index, 2, 9) * 2) - 1;
    return {
      id,
      tileX: EDGE_MARGIN_X + column * PLOT_CELL_WIDTH + Math.floor(PLOT_CELL_WIDTH / 2) + jitterX,
      tileY: EDGE_MARGIN_Y + row * PLOT_CELL_HEIGHT + Math.floor(PLOT_CELL_HEIGHT / 2) + jitterY,
    };
  });
}

function worldSize(plotCount: number) {
  const plotRows = Math.max(1, Math.ceil(plotCount / PLOT_COLUMNS));
  return {
    columns: EDGE_MARGIN_X * 2 + PLOT_COLUMNS * PLOT_CELL_WIDTH,
    rows: EDGE_MARGIN_Y * 2 + plotRows * PLOT_CELL_HEIGHT,
  };
}

/**
 * Ocean fades to surf, then beach, then forest floor. The shoreline depth is
 * noise-driven so the island has coves instead of square corners.
 */
function baseTerrainAt(x: number, y: number, columns: number, rows: number): TerrainKind {
  const distanceToEdge = Math.min(x, y, columns - 1 - x, rows - 1 - y);
  const shore = 2 + valueNoise(x, y, 9, 3) * 4;
  if (distanceToEdge < shore - 1.6) {
    return 'ocean';
  }
  if (distanceToEdge < shore) {
    return 'shallow';
  }
  if (distanceToEdge < shore + 2.4) {
    return 'sand';
  }
  return valueNoise(x, y, 7, 11) > 0.62 ? 'meadow' : 'grass';
}

const distanceTo = (x: number, y: number, plot: ForestPlot) =>
  Math.hypot(x - plot.tileX, y - plot.tileY);

const nearestPlotDistance = (x: number, y: number, plots: ReadonlyArray<ForestPlot>) =>
  plots.reduce(
    (closest, plot) => Math.min(closest, distanceTo(x, y, plot)),
    Number.POSITIVE_INFINITY,
  );

/** Small peaks tucked into the corners the trail never visits. */
function addMountains(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
) {
  const peaks = [
    { radius: 5, x: columns * 0.16, y: rows * 0.07 },
    { radius: 4.5, x: columns * 0.86, y: rows * 0.28 },
    { radius: 4, x: columns * 0.12, y: rows * 0.72 },
    { radius: 4.5, x: columns * 0.88, y: rows * 0.93 },
  ];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const row = terrain[y];
      if (!row || (row[x] !== 'grass' && row[x] !== 'meadow')) {
        continue;
      }
      if (nearestPlotDistance(x, y, plots) < PLOT_PROTECT_RADIUS + 1) {
        continue;
      }
      const wobble = valueNoise(x, y, 5, 17) * 2.4;
      const isPeak = peaks.some(
        (peak) => Math.hypot(x - peak.x, y - peak.y) < peak.radius + wobble,
      );
      if (isPeak) {
        row[x] = 'mountain';
      }
    }
  }
}

/** Stamps a short, slightly ragged section of trail. */
function stampTrail(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  x: number,
  y: number,
) {
  const drift = Math.round(valueNoise(x, y, 6, 21) * 2) - 1;
  for (let offsetY = 0; offsetY < TRAIL_WIDTH; offsetY++) {
    for (let offsetX = 0; offsetX < TRAIL_WIDTH; offsetX++) {
      const tileX = x + offsetX;
      const tileY = y + offsetY + drift;
      if (tileX < 1 || tileY < 1 || tileX >= columns - 1 || tileY >= rows - 1) {
        continue;
      }
      const row = terrain[tileY];
      if (!row || row[tileX] === 'ocean' || row[tileX] === 'shallow') {
        continue;
      }
      row[tileX] = 'path';
    }
  }
}

/** Connects plots in order with elbowed corridors that cut through the peaks. */
function carveTrail(
  terrain: Array<Array<TerrainKind>>,
  columns: number,
  rows: number,
  plots: ReadonlyArray<ForestPlot>,
) {
  for (let index = 0; index < plots.length - 1; index++) {
    const from = plots[index];
    const to = plots[index + 1];
    if (!from || !to) {
      continue;
    }
    const elbowY = index % 2 === 0 ? from.tileY : to.tileY;
    const stepX = from.tileX <= to.tileX ? 1 : -1;
    for (let x = from.tileX; x !== to.tileX + stepX; x += stepX) {
      stampTrail(terrain, columns, rows, x, elbowY);
    }
    const startY = elbowY === from.tileY ? from.tileY : to.tileY;
    const endY = elbowY === from.tileY ? to.tileY : from.tileY;
    const anchorX = elbowY === from.tileY ? to.tileX : from.tileX;
    const stepY = startY <= endY ? 1 : -1;
    for (let y = startY; y !== endY + stepY; y += stepY) {
      stampTrail(terrain, columns, rows, anchorX, y);
    }
  }
}

/** Opens a soft-edged clearing so a card has ground to stand on. */
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
        if (distanceTo(x, y, plot) <= edge && row[x] !== 'ocean' && row[x] !== 'shallow') {
          row[x] = 'clearing';
        }
      }
    }
  }
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

const TRAIL_ADJACENT: ReadonlySet<TerrainKind> = new Set<TerrainKind>(['clearing', 'path']);

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
      if (!kind) {
        continue;
      }
      const roll = hashUnit(x, y, 41);
      if (kind === 'sand') {
        if (roll > 0.965) {
          scenery.push({ kind: 'rock', tileX: x, tileY: y });
        } else if (roll < 0.02) {
          scenery.push({ kind: 'reed', tileX: x, tileY: y });
        }
        continue;
      }
      if (kind === 'clearing') {
        if (roll > 0.93 && nearestPlotDistance(x, y, plots) > CLEARING_RADIUS - 1.5) {
          scenery.push({ kind: 'bloom', tileX: x, tileY: y });
        }
        continue;
      }
      if (kind !== 'grass' && kind !== 'meadow') {
        continue;
      }
      const nextToTrail = hasNeighbour(terrain, x, y, TRAIL_ADJACENT);
      if (nextToTrail) {
        if (roll > 0.9) {
          scenery.push({ kind: roll > 0.96 ? 'stump' : 'bloom', tileX: x, tileY: y });
        }
        continue;
      }
      const density = valueNoise(x, y, 6, 53);
      if (roll < 0.28 + density * 0.62) {
        scenery.push({ kind: roll < 0.35 ? 'pine' : 'oak', tileX: x, tileY: y });
      } else if (roll > 0.965) {
        scenery.push({ kind: 'rock', tileX: x, tileY: y });
      }
    }
  }
  return scenery;
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
 * Builds the island around an ordered list of card ids. The ids drive plot
 * placement, so adding or removing a homepage card reshapes the map instead of
 * leaving an empty glade behind.
 */
export function buildForestWorld(plotIds: ReadonlyArray<string>): ForestWorld {
  const plots = layOutPlots(plotIds);
  const { columns, rows } = worldSize(plotIds.length);

  const terrain: Array<Array<TerrainKind>> = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: columns }, (__, x) => baseTerrainAt(x, y, columns, rows)),
  );

  addMountains(terrain, columns, rows, plots);
  // Clearings first, then the trail, so the path stays unbroken as it runs
  // through each glade rather than being swallowed by it.
  openClearings(terrain, columns, rows, plots);
  carveTrail(terrain, columns, rows, plots);
  const scenery = scatterScenery(terrain, columns, rows, plots);

  // Start on the first clearing's own tile: the trail runs through every plot
  // centre, so whichever way someone walks first they are already on it.
  const firstPlot = plots[0];
  const spawn = findNearestWalkable(
    { columns, rows, terrain },
    firstPlot ? firstPlot.tileX : Math.floor(columns / 2),
    firstPlot ? firstPlot.tileY : Math.floor(rows / 2),
  );

  return { columns, plots, rows, scenery, spawn, terrain };
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

export type MinimapKind = 'clearing' | 'land' | 'peak' | 'trail' | 'water';

const MINIMAP_KIND: Record<TerrainKind, MinimapKind> = {
  clearing: 'clearing',
  grass: 'land',
  meadow: 'land',
  mountain: 'peak',
  ocean: 'water',
  path: 'trail',
  sand: 'land',
  shallow: 'water',
};

/**
 * The same island reduced to five colours, which merges long stretches of beach
 * and forest into single spans — a few hundred rects becomes a few dozen.
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

/**
 * Serialises collision into one string per row of `0`/`1`. This is the only
 * piece of the world the client component needs.
 */
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
