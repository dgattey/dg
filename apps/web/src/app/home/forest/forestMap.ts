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

export type SceneryKind = 'bloom' | 'oak' | 'pine' | 'reed' | 'rock' | 'stump';

export type ScenerySprite = {
  kind: SceneryKind;
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

export type LandmarkRegion =
  | 'forest-grove'
  | 'lakeside'
  | 'meadow-camp'
  | 'mountain-overlook'
  | 'rocky-shore'
  | 'wetland';

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
 * Plot geometry, in tiles. Cells are the footprint plus a guaranteed margin, so
 * the gap between neighbours is `CELL - FOOTPRINT` on every side — enough forest
 * that the trail reads as a walk, and enough that no jitter is needed (and none
 * is used, so spacing stays provable).
 */
const WORLD_COLUMNS = 62;
const MIN_WORLD_ROWS = 86;

/**
 * Authored geographic anchors, not a card grid. Their uneven spacing makes each
 * stop belong to a recognizable place while the footprint dimensions keep the
 * boards provably separate. Special cards choose a matching region by id; all
 * other projects take the next unused anchor.
 */
const LANDMARK_ANCHORS: ReadonlyArray<{
  region: LandmarkRegion;
  tileX: number;
  tileY: number;
}> = [
  { region: 'meadow-camp', tileX: 10, tileY: 19 },
  { region: 'meadow-camp', tileX: 25, tileY: 17 },
  { region: 'mountain-overlook', tileX: 40, tileY: 21 },
  { region: 'mountain-overlook', tileX: 54, tileY: 18 },
  { region: 'forest-grove', tileX: 12, tileY: 39 },
  { region: 'lakeside', tileX: 28, tileY: 42 },
  { region: 'lakeside', tileX: 44, tileY: 36 },
  { region: 'wetland', tileX: 55, tileY: 43 },
  { region: 'rocky-shore', tileX: 9, tileY: 60 },
  { region: 'forest-grove', tileX: 24, tileY: 57 },
  { region: 'meadow-camp', tileX: 40, tileY: 62 },
  { region: 'wetland', tileX: 54, tileY: 58 },
  { region: 'forest-grove', tileX: 12, tileY: 79 },
  { region: 'lakeside', tileX: 29, tileY: 76 },
  { region: 'mountain-overlook', tileX: 45, tileY: 80 },
];

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

const SEED = 20_260_812;

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

const REGION_FOR_ID: ReadonlyArray<[RegExp, LandmarkRegion]> = [
  [/spotify/i, 'forest-grove'],
  [/strava/i, 'mountain-overlook'],
  [/map/i, 'lakeside'],
  [/gattey-sites/i, 'meadow-camp'],
  [/intro/i, 'meadow-camp'],
];

const preferredRegion = (id: string): LandmarkRegion | undefined =>
  REGION_FOR_ID.find(([pattern]) => pattern.test(id))?.[1];

/**
 * Assigns content to geographic anchors. Recognizable cards prefer a region
 * that fits their story (Spotify's listening grove, Strava's overlook, the map
 * at a dock); projects fill the remaining places in deterministic order.
 */
function layOutPlots(ids: ReadonlyArray<string>): Array<ForestPlot> {
  const available = LANDMARK_ANCHORS.slice();
  return ids.map((id) => {
    const desired = preferredRegion(id);
    const matchingIndex = desired ? available.findIndex((anchor) => anchor.region === desired) : -1;
    const anchorIndex = matchingIndex >= 0 ? matchingIndex : 0;
    const anchor = available.splice(anchorIndex, 1)[0];
    if (!anchor) {
      throw new Error('Forest world has no landmark anchors');
    }
    return {
      id,
      ...anchor,
    };
  });
}

function worldSize(plots: ReadonlyArray<ForestPlot>) {
  const lowestAnchor = plots.reduce((lowest, plot) => Math.max(lowest, plot.tileY), 0);
  return { columns: WORLD_COLUMNS, rows: Math.max(MIN_WORLD_ROWS, lowestAnchor + 8) };
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
  const points = [
    { x: 33, y: 36 },
    { x: 25, y: 48 },
    { x: 28, y: 62 },
    { x: 20, y: rows },
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
 * Layered distance fields and value noise produce the underlying geography:
 * an irregular coast, a multi-lobed inland lake feeding a winding river, open
 * meadow basins, wetlands around water, and forest floor everywhere between.
 * Boundaries are deliberately soft and warped rather than geometric masks.
 */
function baseTerrainAt(x: number, y: number, columns: number, rows: number): TerrainKind {
  const distanceToEdge = Math.min(x, y, columns - 1 - x, rows - 1 - y);
  const shore = 1.8 + valueNoise(x, y, 8, 3) * 3.8 + valueNoise(x, y, 19, 5) * 1.4;
  if (distanceToEdge < shore - 1.6) {
    return 'ocean';
  }
  if (distanceToEdge < shore) {
    return 'shallow';
  }
  if (distanceToEdge < shore + 2.4) {
    return 'sand';
  }

  const warpX = (valueNoise(x, y, 11, 71) - 0.5) * 4;
  const warpY = (valueNoise(x, y, 13, 73) - 0.5) * 4;
  const lakeMain = Math.hypot((x + warpX - 35) / 9.5, (y + warpY - 32) / 7);
  const lakeCove = Math.hypot((x - warpX - 29) / 6, (y + warpY - 35) / 5);
  const lakeField = Math.min(lakeMain, lakeCove);
  if (lakeField < 0.88) {
    return 'lake';
  }
  if (lakeField < 1.14) {
    return valueNoise(x, y, 4, 79) > 0.42 ? 'shallow' : 'wetland';
  }

  const river = riverDistance(x + warpX * 0.35, y + warpY * 0.35, rows);
  const riverWidth = 1.05 + valueNoise(x, y, 7, 83) * 0.9;
  if (river < riverWidth) {
    return 'lake';
  }
  if (river < riverWidth + 1.1) {
    return valueNoise(x, y, 5, 89) > 0.35 ? 'wetland' : 'shallow';
  }

  const meadowNoise = valueNoise(x, y, 12, 11) * 0.55 + valueNoise(x, y, 25, 13) * 0.45;
  const meadowBasin = Math.min(
    Math.hypot((x - 17) / 16, (y - 22) / 13),
    Math.hypot((x - 37) / 18, (y - 61) / 16),
  );
  return meadowNoise > 0.55 || meadowBasin < 0.72 ? 'meadow' : 'grass';
}

const distanceTo = (x: number, y: number, plot: ForestPlot) =>
  Math.hypot(x - plot.tileX, y - plot.tileY);

const nearestPlotDistance = (x: number, y: number, plots: ReadonlyArray<ForestPlot>) =>
  plots.reduce(
    (closest, plot) => Math.min(closest, distanceTo(x, y, plot)),
    Number.POSITIVE_INFINITY,
  );

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
  const ridge = [
    { x: columns * 0.7, y: 4 },
    { x: columns * 0.84, y: rows * 0.24 },
    { x: columns * 0.72, y: rows * 0.48 },
    { x: columns * 0.9, y: rows * 0.72 },
    { x: columns * 0.82, y: rows - 4 },
  ];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const row = terrain[y];
      if (!row || (row[x] !== 'grass' && row[x] !== 'meadow' && row[x] !== 'wetland')) {
        continue;
      }
      if (nearestPlotDistance(x, y, plots) < PLOT_PROTECT_RADIUS + 0.5) {
        continue;
      }
      let distance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < ridge.length - 1; index++) {
        const from = ridge[index];
        const to = ridge[index + 1];
        if (from && to) {
          distance = Math.min(distance, distanceToSegment(x, y, from, to));
        }
      }
      const breakNoise = valueNoise(x, y, 9, 17);
      const width = 2.1 + valueNoise(x, y, 6, 19) * 3.4;
      if (distance < width && breakNoise > 0.24) {
        row[x] = 'mountain';
      } else if (distance < width + 2.8 && breakNoise > 0.16) {
        row[x] = 'hill';
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
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const arc = Math.sin(Math.PI * t) * bend;
    const drift = (valueNoise(step, salt, 5, 97) - 0.5) * 1.4;
    const x = Math.round(lerp(from.tileX, to.tileX, t) + normalX * (arc + drift));
    const y = Math.round(lerp(from.tileY, to.tileY, t) + normalY * (arc + drift));
    stampTrail(terrain, columns, rows, x, y, kind);
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
    return x >= rect.minX - 1 && x <= rect.maxX + 1 && y >= rect.minY - 1 && y <= rect.maxY + 1;
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
            scenery.push({ kind: 'rock', tileX: x, tileY: y });
          }
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
      if (kind === 'wetland') {
        if (roll < 0.34) {
          scenery.push({ kind: 'reed', tileX: x, tileY: y });
        } else if (roll > 0.96) {
          scenery.push({ kind: 'bloom', tileX: x, tileY: y });
        }
        continue;
      }
      if (kind === 'hill') {
        if (mayPlantSolid && roll < 0.18) {
          scenery.push({ kind: roll < 0.1 ? 'pine' : 'rock', tileX: x, tileY: y });
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
        scenery.push({ kind: density > 0.65 ? 'pine' : 'oak', tileX: x, tileY: y });
      } else if (roll > 0.972) {
        scenery.push({ kind: 'rock', tileX: x, tileY: y });
      } else if (kind === 'meadow' && roll > 0.9) {
        scenery.push({ kind: 'bloom', tileX: x, tileY: y });
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
  const { columns, rows } = worldSize(plots);

  const terrain: Array<Array<TerrainKind>> = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: columns }, (__, x) => baseTerrainAt(x, y, columns, rows)),
  );

  addMountains(terrain, columns, rows, plots);
  // Clearings first, then the network, so every path remains visible through a
  // landmark's glade and every bridge/pass matches the final collision mask.
  openClearings(terrain, columns, rows, plots);
  carveTrails(terrain, columns, rows, plots);
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
      .filter((sprite) => BLOCKING_SCENERY.has(sprite.kind))
      .map((sprite) => `${sprite.tileX},${sprite.tileY}`),
  );
  return Array.from({ length: world.rows }, (_, y) =>
    Array.from({ length: world.columns }, (__, x) =>
      isWalkableTile(world, x, y) && !blocked.has(`${x},${y}`) ? '0' : '1',
    ).join(''),
  );
}
