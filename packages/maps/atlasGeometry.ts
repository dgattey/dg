import 'server-only';

import {
  boundsWithin,
  decodeRoutes,
  type GeoBounds,
  homeBounds,
  type MapRoute,
} from './src/routeFrame';
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

/** Generous boxes around each home region; routes starting inside one frame its button. */
const ATLAS_REGIONS = [
  {
    box: [
      [36.9, -123.1],
      [38.5, -121.4],
    ],
    key: 'bay-area',
    label: 'Bay Area',
  },
  {
    box: [
      [32.5, -117.6],
      [33.5, -116.6],
    ],
    key: 'san-diego',
    label: 'San Diego',
  },
] as const satisfies ReadonlyArray<{ box: GeoBounds; key: string; label: string }>;

export type AtlasRegion = { bounds: GeoBounds; key: string; label: string };

/** Each home region framed around the routes that start in it, skipping regions without any. */
export const atlasRegions = (routes: ReadonlyArray<MapRoute>): Array<AtlasRegion> => {
  const decoded = decodeRoutes(routes);
  return ATLAS_REGIONS.flatMap(({ box, key, label }) => {
    const bounds = boundsWithin(decoded, box);
    return bounds ? [{ bounds, key, label }] : [];
  });
};
