import { FOREST_SEED_DECK } from '../../../../services/forestSeeds';
import {
  buildForestWorld,
  DEFAULT_FOREST_SEED,
  isWalkableTile,
  landmarkRects,
  landmarkTileRect,
  rectsOverlap,
  TILE_SIZE,
  TREE_KINDS,
  toBlockedMask,
  toTerrainRuns,
  visualTerrainAt,
} from '../forestMap';

const CARD_IDS = [
  'intro',
  'map',
  'project-a',
  'spotify',
  'strava',
  'project-b',
  'project-c',
  'gattey-sites',
  'project-d',
];

const SEEDS = FOREST_SEED_DECK;

const worldFor = (seed: number = DEFAULT_FOREST_SEED, ids: ReadonlyArray<string> = CARD_IDS) =>
  buildForestWorld(ids, seed);

describe('buildForestWorld', () => {
  it('gives every card a plot and grows the island to fit them', () => {
    const world = worldFor();

    expect(world.plots).toHaveLength(CARD_IDS.length);
    expect(world.plots.map((plot) => plot.id)).toEqual(CARD_IDS);
    for (const plot of world.plots) {
      expect(plot.tileX).toBeGreaterThan(0);
      expect(plot.tileX).toBeLessThan(world.columns - 1);
      expect(plot.tileY).toBeGreaterThan(0);
      expect(plot.tileY).toBeLessThan(world.rows - 1);
    }
  });

  it('is deterministic for a seed, so the server and client agree on the same island', () => {
    expect(worldFor(99)).toEqual(worldFor(99));
  });

  it('rolls a different layout for a different seed', () => {
    const a = worldFor(1);
    const b = worldFor(2);
    expect(a.plots.map((plot) => `${plot.tileX},${plot.tileY}`)).not.toEqual(
      b.plots.map((plot) => `${plot.tileX},${plot.tileY}`),
    );
    expect(a.seed).toBe(1);
    expect(b.seed).toBe(2);
  });

  it('keeps listening in the woods, activity up high, and the map by water', () => {
    const world = worldFor();
    expect(world.plots.find((plot) => plot.id === 'spotify')?.region).toBe('woods');
    expect(world.plots.find((plot) => plot.id === 'strava')?.region).toBe('peak');
    expect(world.plots.find((plot) => plot.id === 'map')?.region).toBe('water');
  });

  it('rings the island with ocean', () => {
    const world = worldFor();
    const corners = [
      world.terrain[0]?.[0],
      world.terrain[0]?.[world.columns - 1],
      world.terrain[world.rows - 1]?.[0],
      world.terrain[world.rows - 1]?.[world.columns - 1],
    ];
    expect(corners).toEqual(['ocean', 'ocean', 'ocean', 'ocean']);
  });

  it('builds distinct water, meadow, wetland, forest, hill and mountain regions', () => {
    const world = worldFor();
    const kinds = new Set(world.terrain.flat());
    for (const kind of [
      'bridge',
      'grass',
      'hill',
      'lake',
      'meadow',
      'mountain',
      'ocean',
      'path',
      'trail',
      'wetland',
    ]) {
      expect(kinds).toContain(kind);
    }
  });

  it('draws a branching trail network with main paths, side trails and water crossings', () => {
    const world = worldFor();
    const branchTiles = world.terrain.flatMap((row, y) =>
      row.flatMap((kind, x) => {
        if (kind !== 'path' && kind !== 'trail' && kind !== 'bridge') {
          return [];
        }
        const connected = [
          world.terrain[y - 1]?.[x],
          world.terrain[y + 1]?.[x],
          world.terrain[y]?.[x - 1],
          world.terrain[y]?.[x + 1],
        ].filter(
          (neighbor) => neighbor === 'path' || neighbor === 'trail' || neighbor === 'bridge',
        );
        return connected.length >= 3 ? [`${x},${y}`] : [];
      }),
    );
    expect(branchTiles.length).toBeGreaterThan(0);
    expect(world.terrain.flat()).toContain('path');
    expect(world.terrain.flat()).toContain('trail');
    expect(world.terrain.flat()).toContain('bridge');
  });

  it('runs the trail through every card and keeps its glade clear', () => {
    const world = worldFor();
    const mask = toBlockedMask(world);
    for (const plot of world.plots) {
      const nearby: Array<string> = [];
      for (let offsetY = -2; offsetY <= 2; offsetY++) {
        for (let offsetX = -2; offsetX <= 2; offsetX++) {
          expect(mask[plot.tileY + offsetY]?.[plot.tileX + offsetX]).toBe('0');
          nearby.push(world.terrain[plot.tileY + offsetY]?.[plot.tileX + offsetX] ?? '');
        }
      }
      expect(nearby).toContain('path');
    }
  });

  it('drops the walker somewhere they can stand', () => {
    const world = worldFor();
    expect(toBlockedMask(world)[world.spawn.tileY]?.[world.spawn.tileX]).toBe('0');
  });

  it('links every clearing to the spawn by a walkable route', () => {
    const world = worldFor();
    const mask = toBlockedMask(world);
    const seen = new Set<string>();
    const queue = [[world.spawn.tileX, world.spawn.tileY]];
    while (queue.length > 0) {
      const next = queue.pop();
      if (!next) {
        break;
      }
      const [x, y] = next;
      if (x === undefined || y === undefined) {
        continue;
      }
      const key = `${x},${y}`;
      if (seen.has(key) || mask[y]?.[x] !== '0') {
        continue;
      }
      seen.add(key);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    for (const plot of world.plots) {
      expect(seen.has(`${plot.tileX},${plot.tileY}`)).toBe(true);
    }
  });

  it('leaves no route tile stranded, so every drawn crossing can be walked', () => {
    const world = worldFor();
    const mask = toBlockedMask(world);
    const seen = new Set<string>();
    const queue = [[world.spawn.tileX, world.spawn.tileY]];
    while (queue.length > 0) {
      const next = queue.pop();
      if (!next) {
        break;
      }
      const [x, y] = next;
      if (x === undefined || y === undefined) {
        continue;
      }
      const key = `${x},${y}`;
      if (seen.has(key) || mask[y]?.[x] !== '0') {
        continue;
      }
      seen.add(key);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    const stranded: Array<string> = [];
    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.columns; x++) {
        const kind = world.terrain[y]?.[x];
        if ((kind === 'bridge' || kind === 'path' || kind === 'trail') && !seen.has(`${x},${y}`)) {
          stranded.push(`${kind} ${x},${y}`);
        }
      }
    }
    expect(stranded).toEqual([]);
  });

  it('keeps the ocean unwalkable', () => {
    const world = worldFor();
    const oceanTile = world.terrain[0]?.indexOf('ocean') ?? -1;
    expect(oceanTile).toBeGreaterThanOrEqual(0);
    expect(isWalkableTile(world, oceanTile, 0)).toBe(false);
    expect(isWalkableTile(world, -1, 0)).toBe(false);
    expect(isWalkableTile(world, 0, world.rows)).toBe(false);
  });

  it('blocks visible water and cliffs except where a route paints a crossing or pass', () => {
    const world = worldFor();
    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.columns; x++) {
        const kind = world.terrain[y]?.[x];
        if (kind === 'lake' || kind === 'mountain' || kind === 'ocean' || kind === 'shallow') {
          expect(isWalkableTile(world, x, y)).toBe(false);
        }
        if (kind === 'bridge' || kind === 'path' || kind === 'trail') {
          expect(isWalkableTile(world, x, y)).toBe(true);
        }
      }
    }
  });

  it('varies tree density between forest and open meadow', () => {
    const world = worldFor();
    const trees = new Set(
      world.scenery
        .filter((sprite) => TREE_KINDS.has(sprite.kind))
        .map((sprite) => `${sprite.tileX},${sprite.tileY}`),
    );
    const count = (kind: 'grass' | 'meadow') => {
      let terrainTiles = 0;
      let treeTiles = 0;
      for (let y = 0; y < world.rows; y++) {
        for (let x = 0; x < world.columns; x++) {
          if (world.terrain[y]?.[x] === kind) {
            terrainTiles++;
            if (trees.has(`${x},${y}`)) {
              treeTiles++;
            }
          }
        }
      }
      return treeTiles / terrainTiles;
    };
    expect(count('grass')).toBeGreaterThan(count('meadow') * 2);
  });
});

describe('visualTerrainAt', () => {
  it('breaks a coastal tile into more than one biome so shores are not stairs', () => {
    const world = worldFor();
    const mixed = world.terrain.flatMap((row, y) =>
      row.flatMap((kind, x) => {
        if (kind !== 'sand' && kind !== 'shallow') {
          return [];
        }
        const samples = new Set<string>();
        for (let i = 0; i < 8; i++) {
          samples.add(visualTerrainAt(world, x + (i + 0.5) / 8, y + 0.5));
        }
        return samples.size > 1 ? [`${x},${y}`] : [];
      }),
    );
    expect(mixed.length).toBeGreaterThan(0);
  });
});

describe('toTerrainRuns', () => {
  it('collapses each row into far fewer rects than tiles', () => {
    const world = worldFor();
    const runs = toTerrainRuns(world);
    expect(runs.length).toBeLessThan(world.columns * world.rows * 0.35);
  });

  it('covers every tile of every row exactly once', () => {
    const world = worldFor();
    const covered = new Array<number>(world.rows).fill(0);
    for (const run of toTerrainRuns(world)) {
      const total = covered[run.tileY];
      expect(total).toBe(run.tileX);
      covered[run.tileY] = run.tileX + run.length;
    }
    expect(covered).toEqual(new Array<number>(world.rows).fill(world.columns));
  });
});

describe('toBlockedMask', () => {
  it('emits one row of flags per tile row', () => {
    const world = worldFor();
    const mask = toBlockedMask(world);
    expect(mask).toHaveLength(world.rows);
    for (const row of mask) {
      expect(row).toHaveLength(world.columns);
      expect(row).toMatch(/^[01]+$/);
    }
  });

  it('blocks tiles a tree is standing on', () => {
    const world = worldFor();
    const mask = toBlockedMask(world);
    const tree = world.scenery.find((sprite) => TREE_KINDS.has(sprite.kind));
    expect(tree).toBeDefined();
    expect(mask[tree?.tileY ?? 0]?.[tree?.tileX ?? 0]).toBe('1');
  });
});

it('keeps a tile size that fits a card in a clearing', () => {
  expect(TILE_SIZE).toBeGreaterThan(0);
});

describe('landmark footprints', () => {
  const idsFor = (count: number) => Array.from({ length: count }, (_, i) => `card-${i}`);

  it.each([...SEEDS])('reserve rectangles that never overlap on seed %i', (seed) => {
    const rects = landmarkRects(worldFor(seed));
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        if (a && b) {
          expect(rectsOverlap(a, b)).toBe(false);
        }
      }
    }
  });

  it.each([[1], [2], [3], [6], [9], [12], [15]])(
    'reserve rectangles that never overlap for %i cards',
    (count) => {
      const rects = landmarkRects(buildForestWorld(idsFor(count), DEFAULT_FOREST_SEED));
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i];
          const b = rects[j];
          if (a && b) {
            expect(rectsOverlap(a, b)).toBe(false);
          }
        }
      }
    },
  );

  it('keep every landmark inside the island', () => {
    const world = worldFor();
    const worldWidth = world.columns * TILE_SIZE;
    const worldHeight = world.rows * TILE_SIZE;
    for (const rect of landmarkRects(world)) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.left + rect.width).toBeLessThanOrEqual(worldWidth);
      expect(rect.top + rect.height).toBeLessThanOrEqual(worldHeight);
    }
  });

  it('mow the whole footprint so no tree pokes through a board', () => {
    const world = worldFor();
    const blocking = new Set(
      world.scenery
        .filter((sprite) => TREE_KINDS.has(sprite.kind) || sprite.kind === 'rock')
        .map((sprite) => `${sprite.tileX},${sprite.tileY}`),
    );
    for (const plot of world.plots) {
      const halfWidth = 3;
      for (let y = plot.tileY - 7; y <= plot.tileY; y++) {
        for (let x = plot.tileX - halfWidth; x <= plot.tileX + halfWidth; x++) {
          expect(blocking.has(`${x},${y}`)).toBe(false);
        }
      }
    }
  });

  it('plants grove trees beside boards, outside the footprint', () => {
    const world = worldFor();
    const trees = world.scenery.filter((sprite) => TREE_KINDS.has(sprite.kind));
    for (const plot of world.plots) {
      const nearby = trees.filter(
        (sprite) =>
          Math.abs(sprite.tileX - plot.tileX) >= 4 &&
          Math.abs(sprite.tileX - plot.tileX) <= 6 &&
          Math.abs(sprite.tileY - plot.tileY) <= 4,
      );
      expect(nearby.length).toBeGreaterThan(0);
    }
  });

  it('plants trees south of boards so canopies can stand in front', () => {
    const world = worldFor();
    const trees = world.scenery.filter((sprite) => TREE_KINDS.has(sprite.kind));
    const south = trees.filter((sprite) =>
      world.plots.some(
        (plot) =>
          sprite.tileY >= plot.tileY + 2 &&
          sprite.tileY <= plot.tileY + 4 &&
          Math.abs(sprite.tileX - plot.tileX) <= 4,
      ),
    );
    expect(south.length).toBeGreaterThan(0);
  });
});

describe('critters', () => {
  it('are deterministic and never sit on a board', () => {
    const a = worldFor();
    const b = worldFor();
    expect(a.critters).toEqual(b.critters);
    expect(a.critters.length).toBeGreaterThan(0);
    expect(a.critters.length).toBeLessThanOrEqual(12);
    for (const plot of a.plots) {
      const rect = landmarkTileRect(plot);
      for (const critter of a.critters) {
        const onBoard =
          critter.tileX >= rect.minX &&
          critter.tileX <= rect.maxX &&
          critter.tileY >= rect.minY &&
          critter.tileY <= rect.maxY;
        expect(onBoard).toBe(false);
      }
    }
  });
});

describe('across seeds', () => {
  const walkFromSpawn = (world: ReturnType<typeof worldFor>) => {
    const mask = toBlockedMask(world);
    const seen = new Set<string>();
    const queue = [[world.spawn.tileX, world.spawn.tileY]];
    while (queue.length > 0) {
      const next = queue.pop();
      if (!next) {
        break;
      }
      const [x, y] = next;
      if (x === undefined || y === undefined) {
        continue;
      }
      const key = `${x},${y}`;
      if (seen.has(key) || mask[y]?.[x] !== '0') {
        continue;
      }
      seen.add(key);
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return seen;
  };

  it.each([...SEEDS])('keeps every landmark reachable and in bounds on seed %i', (seed) => {
    const world = worldFor(seed);
    const seen = walkFromSpawn(world);
    const worldWidth = world.columns * TILE_SIZE;
    const worldHeight = world.rows * TILE_SIZE;
    for (const plot of world.plots) {
      expect(seen.has(`${plot.tileX},${plot.tileY}`)).toBe(true);
    }
    for (const rect of landmarkRects(world)) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.left + rect.width).toBeLessThanOrEqual(worldWidth);
      expect(rect.top + rect.height).toBeLessThanOrEqual(worldHeight);
    }
    for (const sprite of world.scenery) {
      expect(sprite.tileX).toBeGreaterThanOrEqual(0);
      expect(sprite.tileX).toBeLessThan(world.columns);
      expect(sprite.tileY).toBeGreaterThanOrEqual(0);
      expect(sprite.tileY).toBeLessThan(world.rows);
    }
  });
});

describe('tree mix', () => {
  it('scatters more than pine and oak', () => {
    const kinds = new Set(worldFor().scenery.map((sprite) => sprite.kind));
    expect(kinds.has('pine') || kinds.has('cedar')).toBe(true);
    expect(kinds.has('oak') || kinds.has('maple')).toBe(true);
    expect(kinds.has('willow') || kinds.has('dead') || kinds.has('bush')).toBe(true);
    expect(kinds.has('maple')).toBe(true);
  });

  it('gives every sprite a scale so groves mix sizes', () => {
    for (const sprite of worldFor().scenery) {
      expect(sprite.scale).toBeGreaterThan(0.5);
      expect(sprite.scale).toBeLessThan(2);
    }
  });
});
