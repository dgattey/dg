import 'server-only';

import { type ForestWorld, sampleTerrainFields, TILE_SIZE } from './forestMap';

/**
 * A quadratic vector coastline. The ground bitmap never paints the waterline;
 * this path is the silhouette, with sand and shallow as strokes.
 */

type Point = { x: number; y: number };
type Segment = { a: Point; b: Point };

const LAND_THRESHOLD = 0.82;
const LAKE_THRESHOLD = 0.88;
const SAMPLE_STEP = 0.25;
const NEAR = 0.08;

const near = (left: Point, right: Point) => Math.hypot(left.x - right.x, left.y - right.y) < NEAR;

function interpolate(
  from: number,
  to: number,
  threshold: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): Point {
  const span = to - from;
  const t = Math.min(1, Math.max(0, span === 0 ? 0.5 : (threshold - from) / span));
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
}

function march(
  values: Float64Array,
  columns: number,
  rows: number,
  threshold: number,
  inside: (value: number, cutoff: number) => boolean,
): Array<Segment> {
  const segments: Array<Segment> = [];
  const at = (x: number, y: number) => values[y * (columns + 1) + x] ?? threshold + 1;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const bl = at(x, y + 1);
      const br = at(x + 1, y + 1);
      const code =
        (inside(tl, threshold) ? 8 : 0) +
        (inside(tr, threshold) ? 4 : 0) +
        (inside(br, threshold) ? 2 : 0) +
        (inside(bl, threshold) ? 1 : 0);
      if (code === 0 || code === 15) {
        continue;
      }
      const top = interpolate(tl, tr, threshold, x, y, x + 1, y);
      const right = interpolate(tr, br, threshold, x + 1, y, x + 1, y + 1);
      const bottom = interpolate(bl, br, threshold, x, y + 1, x + 1, y + 1);
      const left = interpolate(tl, bl, threshold, x, y, x, y + 1);
      const edges: Record<number, readonly [Point, Point]> = {
        1: [left, bottom],
        2: [bottom, right],
        3: [left, right],
        4: [top, right],
        5: [left, top],
        6: [top, bottom],
        7: [left, top],
        8: [left, top],
        9: [top, bottom],
        10: [top, bottom],
        11: [top, right],
        12: [left, right],
        13: [bottom, right],
        14: [left, bottom],
      };
      const pair = edges[code];
      if (pair) {
        segments.push({ a: pair[0], b: pair[1] });
      }
    }
  }
  return segments;
}

function stitch(segments: Array<Segment>): Array<Array<Point>> {
  const unused = [...segments];
  const loops: Array<Array<Point>> = [];
  while (unused.length > 0) {
    const first = unused.pop();
    if (!first) {
      break;
    }
    const loop = [first.a, first.b];
    let grew = true;
    while (grew) {
      grew = false;
      const end = loop[loop.length - 1];
      if (!end) {
        break;
      }
      for (let index = unused.length - 1; index >= 0; index--) {
        const segment = unused[index];
        if (!segment) {
          continue;
        }
        if (near(segment.a, end)) {
          loop.push(segment.b);
          unused.splice(index, 1);
          grew = true;
          break;
        }
        if (near(segment.b, end)) {
          loop.push(segment.a);
          unused.splice(index, 1);
          grew = true;
          break;
        }
      }
    }
    if (loop.length > 40) {
      loops.push(loop);
    }
  }
  return loops;
}

function chaikin(points: ReadonlyArray<Point>): Array<Point> {
  const out: Array<Point> = [];
  for (let index = 0; index < points.length; index++) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    if (!a || !b) {
      continue;
    }
    out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
    out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
  }
  return out;
}

function decimate(points: ReadonlyArray<Point>, max = 120): Array<Point> {
  if (points.length <= max) {
    return [...points];
  }
  const step = points.length / max;
  return Array.from({ length: max }, (_, index) => points[Math.floor(index * step)]).filter(
    (point): point is Point => point !== undefined,
  );
}

function px(value: number) {
  return Math.round(value * SAMPLE_STEP * TILE_SIZE);
}

function toPath(loops: ReadonlyArray<ReadonlyArray<Point>>): string {
  return loops
    .map((points) => {
      const first = points[0];
      if (!first) {
        return '';
      }
      let path = `M${px(first.x)} ${px(first.y)}`;
      for (let index = 1; index < points.length; index += 2) {
        const control = points[index];
        const end = points[index + 1] ?? points[0];
        if (!control || !end) {
          continue;
        }
        path += `Q${px(control.x)} ${px(control.y)} ${px(end.x)} ${px(end.y)}`;
      }
      return `${path}Z`;
    })
    .join('');
}

function sampleGrid(
  world: ForestWorld,
  read: (fields: ReturnType<typeof sampleTerrainFields>) => number,
): { columns: number; rows: number; values: Float64Array } {
  const columns = Math.round(world.columns / SAMPLE_STEP);
  const rows = Math.round(world.rows / SAMPLE_STEP);
  const values = new Float64Array((columns + 1) * (rows + 1));
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= columns; x++) {
      values[y * (columns + 1) + x] = read(
        sampleTerrainFields(world, x * SAMPLE_STEP, y * SAMPLE_STEP),
      );
    }
  }
  return { columns, rows, values };
}

function perimeter(points: ReadonlyArray<Point>) {
  return points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length];
    return next ? total + Math.hypot(next.x - point.x, next.y - point.y) : total;
  }, 0);
}

function smoothedLoops(
  grid: { columns: number; rows: number; values: Float64Array },
  threshold: number,
  inside: (value: number, cutoff: number) => boolean,
): Array<Array<Point>> {
  return stitch(march(grid.values, grid.columns, grid.rows, threshold, inside))
    .map((loop) => decimate(chaikin(chaikin(loop))))
    .filter((loop) => perimeter(loop) > 18);
}

/**
 * Even-odd clip path: the island fill, with lakes punched out. Coordinates
 * match the world box so the sand stroke can ring the painted shore.
 */
export function forestShoreClipPath(world: ForestWorld): string {
  const island = sampleGrid(world, (fields) => fields.island);
  const lake = sampleGrid(world, (fields) => fields.lakeField);
  const land = smoothedLoops(island, LAND_THRESHOLD, (value, cutoff) => value < cutoff);
  const holes = smoothedLoops(lake, LAKE_THRESHOLD, (value, cutoff) => value < cutoff);
  return `${toPath(land)}${toPath(holes)}`;
}
