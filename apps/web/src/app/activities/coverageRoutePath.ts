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

export function coverageRoutePath(
  outings: ReadonlyArray<Pick<StravaLogEntry, 'polyline'>>,
  { projection: { origin, perDegree }, viewBox }: Pick<StreetCoverage, 'projection' | 'viewBox'>,
) {
  const [left = 0, top = 0, width = 0, height = 0] = viewBox.split(' ').map(Number);
  const inBox = ([x, y]: Point) => x >= left && x <= left + width && y >= top && y <= top + height;
  const runs: Array<string> = [];
  const seen = new Set<string>();
  for (const { polyline } of outings) {
    let start: Point | null = null;
    let drawn: Point | null = null;
    let steps: Array<string> = [];
    const flush = () => {
      if (start && steps.length) {
        runs.push(`M${start[0]} ${start[1]}l${steps.join(' ')}`);
      }
      start = null;
      steps = [];
    };
    let previous: Point | null = null;
    for (const [lat, lng] of polyline ? decodePolyline(polyline) : []) {
      const point: Point = [
        Math.round((lng - origin.lng) * perDegree.lng),
        Math.round((lat - origin.lat) * perDegree.lat),
      ];
      if (previous && (inBox(previous) || inBox(point))) {
        if (!drawn) {
          drawn = previous;
        }
        if (Math.hypot(point[0] - drawn[0], point[1] - drawn[1]) >= MIN_VIEWBOX_STEP) {
          const edgeKey = segmentKey(drawn, point);
          if (seen.has(edgeKey)) {
            flush();
            drawn = point;
          } else {
            seen.add(edgeKey);
            if (!start) {
              start = drawn;
            }
            steps.push(`${point[0] - drawn[0]} ${point[1] - drawn[1]}`);
            drawn = point;
          }
        }
      } else {
        flush();
        drawn = null;
      }
      previous = point;
    }
    flush();
  }
  return runs.join('');
}
