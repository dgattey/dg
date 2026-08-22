import type { Point } from 'pigeon-maps';

export const FIELD_COLS = 56;
export const FIELD_ROWS = 36;
export const ISO_COUNT = 16;

function hash2(ix: number, iy: number, seed: number) {
  let value = Math.imul(ix, 374_761_393) ^ Math.imul(iy, 668_265_263) ^ seed;
  value = Math.imul(value ^ (value >>> 13), 1_274_126_177);
  return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296;
}

function fade(value: number) {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

/** Deterministic value noise in [0, 1]. */
export function valueNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  return lerp(
    lerp(hash2(x0, y0, seed), hash2(x0 + 1, y0, seed), fx),
    lerp(hash2(x0, y0 + 1, seed), hash2(x0 + 1, y0 + 1, seed), fx),
    fy,
  );
}

export function fbm(x: number, y: number, seed: number, octaves = 5) {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let norm = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    sum += amplitude * valueNoise(x * frequency, y * frequency, seed + octave * 101);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.05;
  }
  return sum / norm;
}

function interpolate(a: number, b: number, valueA: number, valueB: number, iso: number): number {
  const span = valueB - valueA;
  if (Math.abs(span) < 1e-9) {
    return a;
  }
  return a + ((iso - valueA) / span) * (b - a);
}

type Segment = { a: Point; b: Point };

/**
 * Marching-squares segments for one iso value over a lat/lng sample grid.
 * `samples` is row-major, `(rows + 1) * (cols + 1)` values.
 */
export function marchingSquares({
  cols,
  iso,
  rows,
  samples,
  xs,
  ys,
}: {
  cols: number;
  iso: number;
  rows: number;
  samples: Array<number>;
  xs: Array<number>;
  ys: Array<number>;
}): Array<Segment> {
  const segments: Array<Segment> = [];
  const at = (col: number, row: number) => samples[row * (cols + 1) + col] ?? 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x0 = xs[col] ?? 0;
      const x1 = xs[col + 1] ?? x0;
      const y0 = ys[row] ?? 0;
      const y1 = ys[row + 1] ?? y0;
      const v00 = at(col, row);
      const v10 = at(col + 1, row);
      const v11 = at(col + 1, row + 1);
      const v01 = at(col, row + 1);
      const code =
        (v00 >= iso ? 1 : 0) | (v10 >= iso ? 2 : 0) | (v11 >= iso ? 4 : 0) | (v01 >= iso ? 8 : 0);
      if (code === 0 || code === 15) {
        continue;
      }

      const bottom: Point = [
        interpolate(y0, y0, v00, v10, iso),
        interpolate(x0, x1, v00, v10, iso),
      ];
      const right: Point = [interpolate(y0, y1, v10, v11, iso), interpolate(x1, x1, v10, v11, iso)];
      const top: Point = [interpolate(y1, y1, v01, v11, iso), interpolate(x0, x1, v01, v11, iso)];
      const left: Point = [interpolate(y0, y1, v00, v01, iso), interpolate(x0, x0, v00, v01, iso)];

      const edges: Record<number, [Point, Point] | undefined> = {
        1: [left, bottom],
        2: [bottom, right],
        3: [left, right],
        4: [right, top],
        5: [left, bottom],
        6: [bottom, top],
        7: [left, top],
        8: [top, left],
        9: [bottom, top],
        10: [bottom, right],
        11: [right, top],
        12: [right, left],
        13: [bottom, right],
        14: [bottom, left],
      };

      // Saddle 5 / 10: emit both pairs so the field stays continuous.
      if (code === 5) {
        segments.push({ a: left, b: top }, { a: bottom, b: right });
        continue;
      }
      if (code === 10) {
        segments.push({ a: bottom, b: left }, { a: right, b: top });
        continue;
      }

      const pair = edges[code];
      if (pair) {
        segments.push({ a: pair[0], b: pair[1] });
      }
    }
  }

  return segments;
}

function pointKey(point: Point) {
  return `${point[0].toFixed(6)}:${point[1].toFixed(6)}`;
}

/** Walk unused segments into polylines. */
export function stitchSegments(segments: Array<Segment>): Array<Array<Point>> {
  const unused = new Set(segments);
  const byPoint = new Map<string, Array<Segment>>();
  const add = (point: Point, segment: Segment) => {
    const key = pointKey(point);
    const list = byPoint.get(key);
    if (list) {
      list.push(segment);
    } else {
      byPoint.set(key, [segment]);
    }
  };
  for (const segment of segments) {
    add(segment.a, segment);
    add(segment.b, segment);
  }

  const lines: Array<Array<Point>> = [];
  const take = (point: Point): Segment | undefined => {
    const list = byPoint.get(pointKey(point));
    while (list && list.length > 0) {
      const next = list.pop();
      if (next && unused.has(next)) {
        unused.delete(next);
        return next;
      }
    }
    return undefined;
  };

  for (const start of segments) {
    if (!unused.has(start)) {
      continue;
    }
    unused.delete(start);
    const line = [start.a, start.b];
    let head = start.b;
    let next = take(head);
    while (next) {
      const follow = pointKey(next.a) === pointKey(head) ? next.b : next.a;
      line.push(follow);
      head = follow;
      next = take(head);
    }
    let tail = start.a;
    next = take(tail);
    while (next) {
      const follow = pointKey(next.a) === pointKey(tail) ? next.b : next.a;
      line.unshift(follow);
      tail = follow;
      next = take(tail);
    }
    lines.push(line);
  }

  return lines;
}
