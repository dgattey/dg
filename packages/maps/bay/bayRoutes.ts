import {
  STRAVA_SPORTS,
  type StravaRouteTrace,
  type StravaSport,
} from '@dg/content-models/strava/StravaHistory';
import { decodePolyline } from '../src/routeGeometry';
import {
  frameAround,
  type LatLon,
  type MercatorFrame,
  overlapsFrame,
  type Pixel,
  projection,
  snap,
  subpath,
} from './mercatorFrame';

/** Every trace of one sport in one year, merged into a single path. */
export type RouteGroup = {
  sport: StravaSport;
  year: number;
  routes: number;
  d: string;
};

const MIN_FOCUS_LON_SPAN = 0.03;
const ROUTE_TOLERANCE_PX = 0.8;

/** Decodes a stored polyline, or null when it is malformed or too short to draw. */
function decodeRoute(polyline: string): Array<LatLon> | null {
  try {
    const points = decodePolyline(polyline);
    return points.length > 1 ? points : null;
  } catch {
    return null;
  }
}

function distanceToLine([px, py]: Pixel, [ax, ay]: Pixel, [bx, by]: Pixel) {
  const length = Math.hypot(bx - ax, by - ay);
  return length === 0
    ? Math.hypot(px - ax, py - ay)
    : Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / length;
}

/** Douglas-Peucker: keeps only the points that bend the line by more than `tolerance` pixels. */
function simplify(points: ReadonlyArray<Pixel>, tolerance: number): Array<Pixel> {
  const keep = points.map((_, index) => index === 0 || index === points.length - 1);
  const spans: Array<readonly [number, number]> = [[0, points.length - 1]];
  for (let span = spans.pop(); span; span = spans.pop()) {
    const [from, to] = span;
    const [start, end] = [points[from], points[to]];
    let farthest = -1;
    let farthestDistance = tolerance;
    for (let index = from + 1; index < to && start && end; index += 1) {
      const point = points[index];
      const distance = point ? distanceToLine(point, start, end) : 0;
      if (distance > farthestDistance) {
        farthest = index;
        farthestDistance = distance;
      }
    }
    if (farthest > 0) {
      keep[farthest] = true;
      spans.push([from, farthest], [farthest, to]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

const segmentKey = ([ax, ay]: Pixel, [bx, by]: Pixel) =>
  ax < bx || (ax === bx && ay <= by) ? `${ax},${ay},${bx},${by}` : `${bx},${by},${ax},${ay}`;

type GroupDraft = Omit<RouteGroup, 'd'> & { paths: Array<string> };

/**
 * Groups traces by sport and year, one path per group. Lines are simplified
 * to within a pixel, and a pixel segment the same sport already drew is
 * skipped, so a thousand laps of one loop cost one loop of markup. Newer
 * years claim shared segments first, so any sport or year filter over the
 * groups still draws every route it counts. Only traces that cross the frame
 * count toward `routes`.
 */
export function routeGroups(
  frame: MercatorFrame,
  routes: ReadonlyArray<StravaRouteTrace>,
): Array<RouteGroup> {
  const { project } = projection(frame);
  const groups = new Map<string, GroupDraft>();
  const drawnBySport = new Map<StravaSport, Set<string>>();
  for (const route of [...routes].sort((a, b) => b.year - a.year)) {
    const points = decodeRoute(route.polyline);
    if (!points) {
      continue;
    }
    const key = `${route.year}:${route.sport}`;
    const group = groups.get(key) ?? { paths: [], routes: 0, sport: route.sport, year: route.year };
    const drawn = drawnBySport.get(route.sport) ?? new Set<string>();
    drawnBySport.set(route.sport, drawn);
    let crossesFrame = false;
    let run: Array<Pixel> = [];
    let previous: Pixel | null = null;
    for (const point of snap(simplify(points.map(project), ROUTE_TOLERANCE_PX), 1, 1)) {
      if (previous) {
        const inFrame = overlapsFrame([previous, point], frame);
        const id = segmentKey(previous, point);
        crossesFrame ||= inFrame;
        if (inFrame && !drawn.has(id)) {
          drawn.add(id);
          if (run.length === 0) {
            run.push(previous);
          }
          run.push(point);
        } else if (run.length > 0) {
          group.paths.push(subpath(run, 1, false));
          run = [];
        }
      }
      previous = point;
    }
    group.paths.push(subpath(run, 1, false));
    if (crossesFrame) {
      group.routes += 1;
      groups.set(key, group);
    }
  }
  return [...groups.values()]
    .sort(
      (a, b) => a.year - b.year || STRAVA_SPORTS.indexOf(a.sport) - STRAVA_SPORTS.indexOf(b.sport),
    )
    .map(({ paths, routes: count, sport, year }) => ({
      d: paths.join(''),
      routes: count,
      sport,
      year,
    }));
}

/** One route framed for a print: a frame around it, never tighter than a few kilometers, and its path. */
export function routeFocus(polyline: string, width: number, height: number, padding: number) {
  const points = decodeRoute(polyline);
  if (!points) {
    return null;
  }
  const fitted = frameAround(points, width, height, padding);
  const frame = { ...fitted, lonSpan: Math.max(fitted.lonSpan, MIN_FOCUS_LON_SPAN) };
  return { d: subpath(snap(points.map(projection(frame).project), 10, 0.5), 10, false), frame };
}

/** A route's shape alone, fitted to a width x height box, for thumbnails. */
export function routeSilhouette(polyline: string, width: number, height: number, padding: number) {
  const points = decodeRoute(polyline);
  if (!points) {
    return null;
  }
  const { project } = projection(frameAround(points, width, height, padding));
  return subpath(snap(points.map(project), 10, 0.4), 10, false);
}
