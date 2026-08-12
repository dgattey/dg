import {
  buildForestWorld,
  isWalkableTile,
  TILE_SIZE,
  toBlockedMask,
  toTerrainRuns,
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

describe('buildForestWorld', () => {
  it('gives every card a plot and grows the island to fit them', () => {
    const world = buildForestWorld(CARD_IDS);

    expect(world.plots).toHaveLength(CARD_IDS.length);
    expect(world.plots.map((plot) => plot.id)).toEqual(CARD_IDS);
    for (const plot of world.plots) {
      expect(plot.tileX).toBeGreaterThan(0);
      expect(plot.tileX).toBeLessThan(world.columns - 1);
      expect(plot.tileY).toBeGreaterThan(0);
      expect(plot.tileY).toBeLessThan(world.rows - 1);
    }
  });

  it('is deterministic, so the server and client agree on the same island', () => {
    expect(buildForestWorld(CARD_IDS)).toEqual(buildForestWorld(CARD_IDS));
  });

  it('rings the island with ocean', () => {
    const world = buildForestWorld(CARD_IDS);
    const corners = [
      world.terrain[0]?.[0],
      world.terrain[0]?.[world.columns - 1],
      world.terrain[world.rows - 1]?.[0],
      world.terrain[world.rows - 1]?.[world.columns - 1],
    ];
    expect(corners).toEqual(['ocean', 'ocean', 'ocean', 'ocean']);
  });

  it('runs the trail through every card and keeps its glade clear', () => {
    const world = buildForestWorld(CARD_IDS);
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
    const world = buildForestWorld(CARD_IDS);
    expect(toBlockedMask(world)[world.spawn.tileY]?.[world.spawn.tileX]).toBe('0');
  });

  it('links every clearing to the spawn by a walkable route', () => {
    const world = buildForestWorld(CARD_IDS);
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

  it('keeps the ocean unwalkable', () => {
    const world = buildForestWorld(CARD_IDS);
    const oceanTile = world.terrain[0]?.indexOf('ocean') ?? -1;
    expect(oceanTile).toBeGreaterThanOrEqual(0);
    expect(isWalkableTile(world, oceanTile, 0)).toBe(false);
    expect(isWalkableTile(world, -1, 0)).toBe(false);
    expect(isWalkableTile(world, 0, world.rows)).toBe(false);
  });
});

describe('toTerrainRuns', () => {
  it('collapses each row into far fewer rects than tiles', () => {
    const world = buildForestWorld(CARD_IDS);
    const runs = toTerrainRuns(world);
    expect(runs.length).toBeLessThan(world.columns * world.rows * 0.35);
  });

  it('covers every tile of every row exactly once', () => {
    const world = buildForestWorld(CARD_IDS);
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
    const world = buildForestWorld(CARD_IDS);
    const mask = toBlockedMask(world);
    expect(mask).toHaveLength(world.rows);
    for (const row of mask) {
      expect(row).toHaveLength(world.columns);
      expect(row).toMatch(/^[01]+$/);
    }
  });

  it('blocks tiles a tree is standing on', () => {
    const world = buildForestWorld(CARD_IDS);
    const mask = toBlockedMask(world);
    const tree = world.scenery.find((sprite) => sprite.kind === 'pine');
    expect(tree).toBeDefined();
    expect(mask[tree?.tileY ?? 0]?.[tree?.tileX ?? 0]).toBe('1');
  });
});

it('keeps a tile size that fits a card in a clearing', () => {
  expect(TILE_SIZE).toBeGreaterThan(0);
});
