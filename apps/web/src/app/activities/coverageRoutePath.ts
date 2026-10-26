import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import type { StreetCoverage } from '@dg/content-models/strava/StreetCoverage';
import { decodePolyline } from '@dg/maps/src/routeGeometry';

const MIN_VIEWBOX_STEP = 1.5;

type Point = [number, number];

const segmentKey = (a: Point, b: Point) => {
  const ax = Math.round(a[0] / 2);
  const ay = Math.round(a[1] / 2);
  const bx = Math.round(b[0] / 2);
  const by = Math.round(b[1] / 2);
  return ax < bx || (ax === bx && ay < by) ? `${ax},${ay}:${bx},${by}` : `${bx},${by}:${ax},${ay}`;
};

type ProjectedCoverageStep = {
  drawn: Point;
  edgeKey: string;
  point: Point;
  step: string;
} | null;

const coverageStepsCache = new Map<string, ReadonlyArray<ProjectedCoverageStep>>();

function projectedCoverageSteps(
  polyline: string,
  viewBox: string,
  origin: { lat: number; lng: number },
  perDegree: { lat: number; lng: number },
  inBox: (pt: Point) => boolean,
): ReadonlyArray<ProjectedCoverageStep> {
  const cacheKey = `${viewBox}|${origin.lat},${origin.lng}|${perDegree.lat},${perDegree.lng}|${polyline}`;
  const cached = coverageStepsCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const out: Array<ProjectedCoverageStep> = [];
  let drawn: Point | null = null;
  let previous: Point | null = null;
  for (const [lat, lng] of decodePolyline(polyline)) {
    const point: Point = [
      Math.round((lng - origin.lng) * perDegree.lng),
      Math.round((lat - origin.lat) * perDegree.lat),
    ];
    if (previous && (inBox(previous) || inBox(point))) {
      if (!drawn) {
        drawn = previous;
      }
      if (Math.hypot(point[0] - drawn[0], point[1] - drawn[1]) >= MIN_VIEWBOX_STEP) {
        out.push({
          drawn,
          edgeKey: segmentKey(drawn, point),
          point,
          step: `${point[0] - drawn[0]} ${point[1] - drawn[1]}`,
        });
        drawn = point;
      }
    } else {
      if (out.length > 0 && out.at(-1) !== null) {
        out.push(null);
      }
      drawn = null;
    }
    previous = point;
  }
  coverageStepsCache.set(cacheKey, out);
  return out;
}

export function coverageRoutePath(
  outings: ReadonlyArray<Pick<StravaLogEntry, 'polyline'>>,
  { projection: { origin, perDegree }, viewBox }: Pick<StreetCoverage, 'projection' | 'viewBox'>,
) {
  const [left = 0, top = 0, width = 0, height = 0] = viewBox.split(' ').map(Number);
  const inBox = ([x, y]: Point) => x >= left && x <= left + width && y >= top && y <= top + height;
  const runs: Array<string> = [];
  const seen = new Set<string>();
  for (const { polyline } of outings) {
    if (!polyline) {
      continue;
    }
    let start: Point | null = null;
    let steps: Array<string> = [];
    const flush = () => {
      if (start && steps.length) {
        runs.push(`M${start[0]} ${start[1]}l${steps.join(' ')}`);
      }
      start = null;
      steps = [];
    };
    for (const item of projectedCoverageSteps(polyline, viewBox, origin, perDegree, inBox)) {
      if (!item) {
        flush();
        continue;
      }
      if (seen.has(item.edgeKey)) {
        flush();
      } else {
        seen.add(item.edgeKey);
        if (!start) {
          start = item.drawn;
        }
        steps.push(item.step);
      }
    }
    flush();
  }
  return runs.join('');
}
