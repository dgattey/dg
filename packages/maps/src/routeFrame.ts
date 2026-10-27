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
export type FramedPath = {
  d: string;
  opacity?: number;
  stroke?: string;
  tone: string;
  width?: number;
};

const CELL_DEGREES = 0.5;
const TRIM_FRACTION = 0.02;
const HOME_LAT_RADIUS = 0.17;
const HOME_LNG_RADIUS = 0.32;
const PIXEL_TOLERANCE = 0.6;
const FRAME_MARGIN = 24;
const GAP_KM = 5;
const KM_PER_DEGREE = 111.32;

const HEATMAP_TIERS = [
  { opacity: 0.36, stroke: 'light-dark(#2c4db0, #457ae0)', widthMul: 0.9 },
  { opacity: 0.66, stroke: 'light-dark(#2658c8, #5896f5)', widthMul: 1 },
  { opacity: 0.94, stroke: 'light-dark(#7cc4ff, #94d2ff)', widthMul: 1 },
  { opacity: 0.98, stroke: 'light-dark(#e0f2ff, #e6f5ff)', widthMul: 1.12 },
] as const;

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
  if (inside.length === 0) return null;
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
  if (!densest) return null;
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

export function framePaths(
  frame: RouteFrame,
  routes: ReadonlyArray<DecodedRoute>,
  margin = FRAME_MARGIN,
  tolerance = PIXEL_TOLERANCE,
): Array<FramedPath> {
  const onScreen = (pixel: { x: number; y: number }) => isNearFrame(pixel, frame, margin);
  const byTone = new Map<string, Array<string>>();
  const seenByTone = new Map<string, Set<string>>();
  for (const { points, tone } of routes) {
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
    for (const leg of routeLegs(points)) {
      const pixels = projectRouteToPixels({ ...frame, points: leg });
      if (!pixels.some(onScreen)) continue;
      const simplified = simplifyLine(pixels, tolerance, ({ x, y }) => [x, y]);
      const rounded: Array<readonly [number, number]> = [];
      for (const { x, y } of simplified) {
        const point = [Math.round(x), Math.round(y)] as const;
        const prev = rounded.at(-1);
        if (!prev || prev[0] !== point[0] || prev[1] !== point[1]) rounded.push(point);
      }
      let start: readonly [number, number] | null = null;
      let prev: readonly [number, number] | null = null;
      let steps: Array<string> = [];
      const flush = () => {
        if (start && steps.length > 0) {
          runs.push(`M${start[0]} ${start[1]}l${steps.join(' ').replace(/ -/g, '-')}`);
        }
        start = null;
        steps = [];
      };
      for (let i = 1; i < rounded.length; i += 1) {
        const a = rounded[i - 1];
        const b = rounded[i];
        if (!a || !b) continue;
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

const edgeHash = (x0: number, y0: number, x1: number, y1: number) =>
  x0 < x1 || (x0 === x1 && y0 < y1)
    ? ((x0 & 0xfff) << 20) ^ ((y0 & 0xfff) << 10) ^ ((x1 & 0xfff) << 5) ^ (y1 & 0xfff)
    : ((x1 & 0xfff) << 20) ^ ((y1 & 0xfff) << 10) ^ ((x0 & 0xfff) << 5) ^ (y0 & 0xfff);

/** Projects all routes into the Option D (Collage Ink & Ice) 4-step frequency heatmap. */
export function frameHeatmap(
  frame: RouteFrame,
  routes: ReadonlyArray<DecodedRoute>,
): Array<FramedPath> {
  const m = 16;
  const gw = (frame.width + m * 2) >> 2;
  const gh = (frame.height + m * 2) >> 2;
  const grid = new Uint16Array(gw * gh);
  const stamp = new Int32Array(gw * gh);
  const seen = new Set<number>();
  const segs: Array<readonly [number, number, number, number, number]> = [];
  let maxCount = 1;
  let routeIdx = 0;
  for (const { points } of routes) {
    routeIdx += 1;
    for (const leg of routeLegs(points)) {
      const pixels = projectRouteToPixels({ ...frame, points: leg });
      let prevX = -999999;
      let prevY = -999999;
      for (const { x, y } of pixels) {
        const sx = Math.round(x);
        const sy = Math.round(y);
        if (sx === prevX && sy === prevY) continue;
        const vis =
          prevX !== -999999 &&
          (isNearFrame({ x: prevX, y: prevY }, frame, m) ||
            isNearFrame({ x: sx, y: sy }, frame, m));
        if (vis) {
          const gx = (((prevX + sx) >> 1) + m) >> 2;
          const gy = (((prevY + sy) >> 1) + m) >> 2;
          if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) {
            const idx = gy * gw + gx;
            if (stamp[idx] !== routeIdx) {
              stamp[idx] = routeIdx;
              const c = (grid[idx] ?? 0) + 1;
              grid[idx] = c;
              if (c > maxCount) maxCount = c;
            }
            const k = edgeHash(prevX, prevY, sx, sy);
            if (!seen.has(k)) {
              seen.add(k);
              segs.push([prevX, prevY, sx, sy, idx]);
            }
          }
        }
        prevX = sx;
        prevY = sy;
      }
    }
  }
  if (segs.length === 0) return [];
  const logMax = Math.log(Math.max(maxCount, 6));
  const tierD = ['', '', '', ''];
  const lx = [-999999, -999999, -999999, -999999];
  const ly = [-999999, -999999, -999999, -999999];
  for (const [x0, y0, x1, y1, idx] of segs) {
    const c = grid[idx] ?? 1;
    const u = c <= 1 ? 0 : Math.log(c) / logMax;
    const t = u <= 0 ? 0 : u < 0.48 ? 1 : u < 0.78 ? 2 : 3;
    const step = `${x1 - x0} ${y1 - y0}`.replace(/ -/g, '-');
    tierD[t] += lx[t] === x0 && ly[t] === y0 ? ` ${step}` : `M${x0} ${y0}l${step}`;
    lx[t] = x1;
    ly[t] = y1;
  }
  const zf = Math.max(0, Math.min(1, (frame.zoom - 4) / (15 - 4)));
  const baseW = 0.8 + zf * 1.5;
  const w = (mul: number) => Number((baseW * mul).toFixed(2));
  const layers: Array<FramedPath> = [
    {
      d: `${tierD[0]}${tierD[1]}`,
      opacity: 0.42,
      stroke: 'light-dark(#f7f1e2, #0c1424)',
      tone: 'casing',
      width: w(1.85),
    },
    {
      d: `${tierD[2]}${tierD[3]}`,
      opacity: 0.88,
      stroke: 'light-dark(#193b96, #2354cf)',
      tone: 'sheath',
      width: w(2.05),
    },
    ...HEATMAP_TIERS.map((spec, t) => ({
      d: tierD[t] ?? '',
      opacity: spec.opacity,
      stroke: spec.stroke,
      tone: `tier-${t}`,
      width: w(spec.widthMul),
    })),
  ];
  return layers.filter(({ d }) => d.length > 0);
}

export function routeBounds(polyline: string): GeoBounds | null {
  try {
    const points = decodePolyline(polyline);
    const first = points[0];
    if (!first || points.length < 2) return null;
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
  if (!route) return null;
  const frame = frameAround(route.points, { height: size, padding, width: size });
  return framePaths(frame, routes)[0]?.d ?? null;
}
