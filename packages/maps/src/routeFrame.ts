import type { Point } from 'pigeon-maps';
import {
  decodePolyline,
  fitRouteViewport,
  projectRouteToPixels,
  simplifyLine,
} from './routeGeometry';

export type MapRoute = { id: number; polyline: string; tone: string };

export type DecodedRoute = { id: number; points: Array<Point>; tone: string };

export type GeoBounds = [southWest: Point, northEast: Point];

export type RouteFrame = { center: Point; height: number; width: number; zoom: number };

export type FramedPath = { d: string; tone: string };

const CELL_DEGREES = 0.5;
const TRIM_FRACTION = 0.02;
const HOME_LAT_RADIUS = 0.17;
const HOME_LNG_RADIUS = 0.32;
const PIXEL_TOLERANCE = 0.6;
const FRAME_MARGIN = 24;
const MERCATOR_MAX_LATITUDE = 85.05112878;

export const MERCATOR_REF_ZOOM = 12;
const MERCATOR_REF_SCALE = 256 * 2 ** MERCATOR_REF_ZOOM;
const GAP_KM = 5;
const KM_PER_DEGREE = 111.32;

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
  const homeStarts = starts.filter(([latitude, longitude]) => {
    const [startRow, startColumn] = cellOf([latitude, longitude]);
    return Math.abs(startRow - row) <= 1 && Math.abs(startColumn - column) <= 1;
  });
  const startLats = homeStarts.map(([latitude]) => latitude).toSorted((a, b) => a - b);
  const startLngs = homeStarts.map(([, longitude]) => longitude).toSorted((a, b) => a - b);
  const medianLat = startLats[Math.floor(startLats.length / 2)] ?? 0;
  const medianLng = startLngs[Math.floor(startLngs.length / 2)] ?? 0;
  const nearby = routes.flatMap(({ points }) => {
    const [startRow, startColumn] = cellOf(points[0] ?? [0, 0]);
    return Math.abs(startRow - row) <= 1 && Math.abs(startColumn - column) <= 1 ? points : [];
  });
  const [south, north] = trimmedRange(nearby.map(([latitude]) => latitude));
  const [west, east] = trimmedRange(nearby.map(([, longitude]) => longitude));
  return [
    [Math.max(south, medianLat - HOME_LAT_RADIUS), Math.max(west, medianLng - HOME_LNG_RADIUS)],
    [Math.min(north, medianLat + HOME_LAT_RADIUS), Math.min(east, medianLng + HOME_LNG_RADIUS)],
  ];
}

export function frameAround(
  points: Array<Point>,
  { height, padding, width }: { height: number; padding: number; width: number },
): RouteFrame {
  return { ...fitRouteViewport({ height, padding, points, width }), height, width };
}

const isNearFrame = (
  { x, y }: { x: number; y: number },
  { height, width }: RouteFrame,
  margin: number,
) => x > -margin && x < width + margin && y > -margin && y < height + margin;

type RoundedLeg = ReadonlyArray<readonly [number, number]>;

const mercatorLegsCache = new WeakMap<DecodedRoute, ReadonlyArray<RoundedLeg>>();

function roundSimplifiedLeg(
  leg: Array<Point>,
  projectLeg: (points: Array<Point>) => Array<{ x: number; y: number }>,
  onScreen: (pixel: { x: number; y: number }) => boolean,
): RoundedLeg | null {
  const pixels = projectLeg(leg);
  if (!pixels.some(onScreen)) {
    return null;
  }
  const simplified = simplifyLine(pixels, PIXEL_TOLERANCE, ({ x, y }) => [x, y]);
  const rounded: Array<readonly [number, number]> = [];
  for (const { x, y } of simplified) {
    const point = [Math.round(x), Math.round(y)] as const;
    const prev = rounded.at(-1);
    if (!prev || prev[0] !== point[0] || prev[1] !== point[1]) {
      rounded.push(point);
    }
  }
  return rounded.length > 1 ? rounded : null;
}

function mercatorLegsOf(route: DecodedRoute): ReadonlyArray<RoundedLeg> {
  const cached = mercatorLegsCache.get(route);
  if (cached) {
    return cached;
  }
  const legs = routeLegs(route.points).flatMap((leg) => {
    const rounded = roundSimplifiedLeg(
      leg,
      (points) => points.map(mercatorRefPoint),
      () => true,
    );
    return rounded ? [rounded] : [];
  });
  mercatorLegsCache.set(route, legs);
  return legs;
}

function inkRoundedLegs(
  routes: ReadonlyArray<{ legs: ReadonlyArray<RoundedLeg>; tone: string }>,
  onScreen: (pixel: { x: number; y: number }) => boolean,
): Array<FramedPath> {
  const byTone = new Map<string, Array<string>>();
  const seenByTone = new Map<string, Set<string>>();
  for (const { legs, tone } of routes) {
    let seen = seenByTone.get(tone);
    if (!seen) {
      seen = new Set<string>();
      seenByTone.set(tone, seen);
    }
    let runs = byTone.get(tone);
    if (!runs) {
      runs = [];
      byTone.set(tone, runs);
    }
    for (const rounded of legs) {
      let start: readonly [number, number] | null = null;
      let prev: readonly [number, number] | null = null;
      let steps: Array<string> = [];
      const flush = () => {
        if (start && steps.length > 0) {
          runs.push(`M${start[0]} ${start[1]}l${steps.join(' ')}`);
        }
        start = null;
        steps = [];
      };
      for (let i = 1; i < rounded.length; i += 1) {
        const a = rounded[i - 1];
        const b = rounded[i];
        if (!a || !b) {
          continue;
        }
        if (!onScreen({ x: a[0], y: a[1] }) && !onScreen({ x: b[0], y: b[1] })) {
          flush();
          prev = null;
          continue;
        }
        const edgeKey =
          a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
            ? `${a[0]},${a[1]}:${b[0]},${b[1]}`
            : `${b[0]},${b[1]}:${a[0]},${a[1]}`;
        if (seen.has(edgeKey)) {
          flush();
          prev = null;
          continue;
        }
        seen.add(edgeKey);
        if (!prev) {
          start = a;
          prev = a;
        }
        steps.push(`${b[0] - prev[0]} ${b[1] - prev[1]}`);
        prev = b;
      }
      flush();
    }
  }
  return [...byTone].flatMap(([tone, runs]) =>
    runs.length > 0 ? [{ d: runs.join(''), tone }] : [],
  );
}

function inkPaths(
  routes: ReadonlyArray<DecodedRoute>,
  projectLeg: (points: Array<Point>) => Array<{ x: number; y: number }>,
  onScreen: (pixel: { x: number; y: number }) => boolean,
): Array<FramedPath> {
  return inkRoundedLegs(
    routes.map(({ points, tone }) => ({
      legs: routeLegs(points).flatMap((leg) => {
        const rounded = roundSimplifiedLeg(leg, projectLeg, onScreen);
        return rounded ? [rounded] : [];
      }),
      tone,
    })),
    onScreen,
  );
}

export function framePaths(
  frame: RouteFrame,
  routes: ReadonlyArray<DecodedRoute>,
  margin = FRAME_MARGIN,
): Array<FramedPath> {
  return inkPaths(
    routes,
    (points) => projectRouteToPixels({ ...frame, points }),
    (pixel) => isNearFrame(pixel, frame, margin),
  );
}

export function mercatorRefPoint([latitude, longitude]: Point): { x: number; y: number } {
  const clamped = Math.max(-MERCATOR_MAX_LATITUDE, Math.min(MERCATOR_MAX_LATITUDE, latitude));
  const latRad = (clamped * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * MERCATOR_REF_SCALE,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * MERCATOR_REF_SCALE,
  };
}

export function mercatorPaths(routes: ReadonlyArray<DecodedRoute>): Array<FramedPath> {
  return inkRoundedLegs(
    routes.map((route) => ({ legs: mercatorLegsOf(route), tone: route.tone })),
    () => true,
  );
}

export function routeBounds(polyline: string): GeoBounds | null {
  try {
    const points = decodePolyline(polyline);
    const first = points[0];
    if (!first || points.length < 2) {
      return null;
    }
    let minLat = first[0];
    let maxLat = first[0];
    let minLng = first[1];
    let maxLng = first[1];
    for (const [latitude, longitude] of points) {
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
      minLng = Math.min(minLng, longitude);
      maxLng = Math.max(maxLng, longitude);
    }
    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  } catch {
    return null;
  }
}

export function routeSilhouette(polyline: string, size: number, padding: number) {
  const routes = decodeRoutes([{ id: 0, polyline, tone: 'ink' }]);
  const [route] = routes;
  if (!route) {
    return null;
  }
  const frame = frameAround(route.points, { height: size, padding, width: size });
  return framePaths(frame, routes)[0]?.d ?? null;
}
