import type { StreetCoverage } from '@dg/content-models/strava/StreetCoverage';
import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import { decodePolyline } from '@dg/maps/src/routeGeometry';

/** A point this close to the last one drawn, in `viewBox` units, adds nothing at map scale. */
const MIN_STEP = 1.5;

type Point = [number, number];

/**
 * Every outing's route as one SVG path in `viewBox` units, in whole units.
 * Only segments touching the view box are drawn, so routes elsewhere add nothing.
 */
export function coverageRoutePath(
  outings: ReadonlyArray<Pick<StravaLogEntry, 'polyline'>>,
  { projection: { origin, perDegree }, viewBox }: Pick<StreetCoverage, 'projection' | 'viewBox'>,
) {
  const [left = 0, top = 0, width = 0, height = 0] = viewBox.split(' ').map(Number);
  const inBox = ([x, y]: Point) => x >= left && x <= left + width && y >= top && y <= top + height;
  const runs: Array<string> = [];
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
          start = previous;
          drawn = previous;
        }
        if (Math.hypot(point[0] - drawn[0], point[1] - drawn[1]) >= MIN_STEP) {
          steps.push(`${point[0] - drawn[0]} ${point[1] - drawn[1]}`);
          drawn = point;
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
