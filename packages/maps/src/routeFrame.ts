import type { Point } from 'pigeon-maps';
import {
  decodePolyline,
  fitRouteViewport,
  projectRouteToPixels,
  simplifyLine,
} from './routeGeometry';

/** One route to ink, colored by a paper tone (`vermilion` reads `var(--vermilion)`). */
export type MapRoute = { id: number; polyline: string; tone: string };

type DecodedRoute = { id: number; points: Array<Point>; tone: string };

/** Southwest and northeast corners. */
export type GeoBounds = [Point, Point];

/** A fixed-size Web Mercator viewport that server-projected paths are drawn in. */
export type RouteFrame = { center: Point; height: number; width: number; zoom: number };

/** Every framed route in one tone, joined into a single SVG path. */
export type FramedPath = { d: string; tone: string };

const CELL_DEGREES = 0.5;
const TRIM_FRACTION = 0.02;
const PIXEL_TOLERANCE = 0.6;
const FRAME_MARGIN = 24;
const GAP_KM = 5;
const KM_PER_DEGREE = 111.32;

/** Decodes routes for drawing, dropping any whose polyline is corrupt or a single point. */
export function decodeRoutes(routes: ReadonlyArray<MapRoute>): Array<DecodedRoute> {
  return routes.flatMap(({ id, polyline, tone }) => {
    try {
      const points = decodePolyline(polyline);
      return points.length > 1 ? [{ id, points, tone }] : [];
    } catch {
      return [];
    }
  });
}

const kmBetween = ([latA, lngA]: Point, [latB, lngB]: Point) => {
  const east = (lngB - lngA) * Math.cos(((latA + latB) / 2) * (Math.PI / 180));
  return Math.hypot(latB - latA, east) * KM_PER_DEGREE;
};

/**
 * A route split wherever it jumps more than 5 km between points, which only a
 * paused recording does (a train ride home, a drive to the trailhead), so the
 * jump isn't drawn as a straight line. Drops legs of a single point.
 */
export function routeLegs(points: ReadonlyArray<Point>): Array<Array<Point>> {
  const legs: Array<Array<Point>> = [];
  let leg: Array<Point> = [];
  for (const point of points) {
    const previous = leg.at(-1);
    if (previous && kmBetween(previous, point) > GAP_KM) {
      legs.push(leg);
      leg = [];
    }
    leg.push(point);
  }
  legs.push(leg);
  return legs.filter((each) => each.length > 1);
}

const cellOf = ([latitude, longitude]: Point) =>
  [Math.floor(latitude / CELL_DEGREES), Math.floor(longitude / CELL_DEGREES)] as const;

const trimmedRange = (values: Array<number>): [number, number] => {
  const sorted = values.toSorted((a, b) => a - b);
  const trim = Math.floor(sorted.length * TRIM_FRACTION);
  return [sorted[trim] ?? 0, sorted[sorted.length - 1 - trim] ?? 0];
};

/**
 * Where most routes go: every point of the routes that start in or beside the
 * busiest half-degree cell, trimmed of the outer 2% each way so a few long rides
 * out of town don't stretch it. Null when there are no routes.
 */
/** The trimmed extent of every route that starts inside `box`, or null when none do. */
export function boundsWithin(
  routes: ReadonlyArray<DecodedRoute>,
  [[south, west], [north, east]]: GeoBounds,
): GeoBounds | null {
  const inside = routes.flatMap(({ points }) => {
    const [latitude, longitude] = points[0] ?? [0, 0];
    return latitude >= south && latitude <= north && longitude >= west && longitude <= east
      ? points
      : [];
  });
  if (inside.length === 0) {
    return null;
  }
  const [low, high] = trimmedRange(inside.map(([latitude]) => latitude));
  const [left, right] = trimmedRange(inside.map(([, longitude]) => longitude));
  return [
    [low, left],
    [high, right],
  ];
}

export function homeBounds(routes: ReadonlyArray<DecodedRoute>): GeoBounds | null {
  const starts = routes.flatMap(({ points: [start] }) => (start ? [start] : []));
  const counts = new Map<string, number>();
  let densest: readonly [number, number] | null = null;
  let densestCount = 0;
  for (const start of starts) {
    const cell = cellOf(start);
    const key = cell.join();
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (count > densestCount) {
      densest = cell;
      densestCount = count;
    }
  }
  if (!densest) {
    return null;
  }
  const [row, column] = densest;
  const nearby = routes.flatMap(({ points }) => {
    const [startRow, startColumn] = cellOf(points[0] ?? [0, 0]);
    return Math.abs(startRow - row) <= 1 && Math.abs(startColumn - column) <= 1 ? points : [];
  });
  const [south, north] = trimmedRange(nearby.map(([latitude]) => latitude));
  const [west, east] = trimmedRange(nearby.map(([, longitude]) => longitude));
  return [
    [south, west],
    [north, east],
  ];
}

/** The frame of `width` by `height` that fits `points` with `padding` pixels to spare. */
export function frameAround(
  points: Array<Point>,
  { height, padding, width }: { height: number; padding: number; width: number },
): RouteFrame {
  return { ...fitRouteViewport({ height, padding, points, width }), height, width };
}

const isNearFrame = ({ x, y }: { x: number; y: number }, { height, width }: RouteFrame) =>
  x > -FRAME_MARGIN && x < width + FRAME_MARGIN && y > -FRAME_MARGIN && y < height + FRAME_MARGIN;

/**
 * Projects routes into the frame's pixels, skipping any that never come near
 * it, and joins each tone's routes into one relative SVG path. Paths keep the
 * order their tone first appears in, so later tones ink over earlier ones.
 */
export function framePaths(
  frame: RouteFrame,
  routes: ReadonlyArray<DecodedRoute>,
): Array<FramedPath> {
  const byTone = new Map<string, string>();
  for (const { points, tone } of routes) {
    for (const leg of routeLegs(points)) {
      const pixels = projectRouteToPixels({ ...frame, points: leg });
      if (!pixels.some((pixel) => isNearFrame(pixel, frame))) {
        continue;
      }
      const [first, ...rest] = simplifyLine(pixels, PIXEL_TOLERANCE, ({ x, y }) => [x, y]).map(
        ({ x, y }) => [Math.round(x * 10), Math.round(y * 10)] as const,
      );
      if (!first) {
        continue;
      }
      let d = `M${first[0] / 10} ${first[1] / 10}`;
      let previous = first;
      for (const pixel of rest) {
        d += `l${(pixel[0] - previous[0]) / 10} ${(pixel[1] - previous[1]) / 10}`;
        previous = pixel;
      }
      byTone.set(tone, (byTone.get(tone) ?? '') + d);
    }
  }
  return [...byTone].map(([tone, d]) => ({ d, tone }));
}

/** A route's shape alone, fitted into a `size` square, or null when the polyline has no route. */
export function routeSilhouette(polyline: string, size: number, padding: number) {
  const routes = decodeRoutes([{ id: 0, polyline, tone: 'ink' }]);
  const [route] = routes;
  if (!route) {
    return null;
  }
  const frame = frameAround(route.points, { height: size, padding, width: size });
  return framePaths(frame, routes)[0]?.d ?? null;
}
