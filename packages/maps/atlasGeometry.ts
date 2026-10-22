import 'server-only';

import { decodeRoutes, type GeoBounds, homeBounds, type MapRoute } from './src/routeFrame';
import { decodePolyline, encodePolyline, simplifyLine } from './src/routeGeometry';

/** About 20 m: invisible at city zoom, and it halves what the page ships for every route. */
const SIMPLIFY_DEGREES = 2e-4;

const BAY_AREA: GeoBounds = [
  [37.35, -122.8],
  [38.12, -121.85],
];

/** A route re-encoded with fewer points, so the browser receives and decodes less. */
export const simplifyPolyline = (polyline: string): string =>
  encodePolyline(
    simplifyLine(decodePolyline(polyline), SIMPLIFY_DEGREES, ([latitude, longitude]) => [
      longitude,
      latitude,
    ]),
  );

/** Where most routes start, for the atlas to open on, or the Bay Area without any. */
export const atlasBounds = (routes: ReadonlyArray<MapRoute>): GeoBounds =>
  homeBounds(decodeRoutes(routes)) ?? BAY_AREA;
