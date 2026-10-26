import type { CoverageCity } from '@dg/content-models/strava/StreetCoverage';
import type { Point } from 'pigeon-maps';
import {
  boundsWithin,
  decodeRoutes,
  type GeoBounds,
  homeBounds,
  type MapRoute,
  routeBounds,
} from './src/routeFrame';
import { decodePolyline } from './src/routeGeometry';

const BAY_AREA: GeoBounds = [
  [37.35, -122.8],
  [38.12, -121.85],
];

export const atlasBounds = (routes: ReadonlyArray<MapRoute>): GeoBounds =>
  homeBounds(decodeRoutes(routes)) ?? BAY_AREA;

const ATLAS_REGIONS = [
  {
    box: [
      [36.9, -123.1],
      [38.5, -121.4],
    ],
    key: 'sf',
    label: 'Bay Area',
  },
  {
    box: [
      [32.5, -117.6],
      [33.5, -116.6],
    ],
    key: 'sd',
    label: 'San Diego',
  },
] as const satisfies ReadonlyArray<{ box: GeoBounds; key: CoverageCity; label: string }>;

export type AtlasRegion = { bounds: GeoBounds; key: CoverageCity; label: string };

export const atlasRegions = (routes: ReadonlyArray<MapRoute>): Array<AtlasRegion> => {
  const decoded = decodeRoutes(routes);
  return ATLAS_REGIONS.flatMap(({ box, key, label }) => {
    const bounds = boundsWithin(decoded, box);
    return bounds ? [{ bounds, key, label }] : [];
  });
};

export function regionForPoint([latitude, longitude]: [number, number]): CoverageCity | null {
  for (const { box, key } of ATLAS_REGIONS) {
    const [[south, west], [north, east]] = box;
    if (latitude >= south && latitude <= north && longitude >= west && longitude <= east) {
      return key;
    }
  }
  return null;
}

const NEAR_DEGREES = 0.35;
const PAD_LAT = 0.025;
const PAD_LNG = 0.035;

const centerOf = ([[south, west], [north, east]]: GeoBounds): Point => [
  (south + north) / 2,
  (west + east) / 2,
];

const openedRouteCache = new Map<string, { bounds: GeoBounds; start: Point } | null>();

const openedRoute = (polyline: string): { bounds: GeoBounds; start: Point } | null => {
  if (openedRouteCache.has(polyline)) {
    return openedRouteCache.get(polyline) ?? null;
  }
  const bounds = routeBounds(polyline);
  if (!bounds) {
    openedRouteCache.set(polyline, null);
    return null;
  }
  try {
    const start = decodePolyline(polyline)[0];
    const result = start ? { bounds, start } : null;
    openedRouteCache.set(polyline, result);
    return result;
  } catch {
    openedRouteCache.set(polyline, null);
    return null;
  }
};

export function latestRouteView(
  polylines: ReadonlyArray<string>,
  regions: ReadonlyArray<AtlasRegion>,
): { bounds: GeoBounds; region: CoverageCity | null } | null {
  let latest: { bounds: GeoBounds; start: Point } | null = null;
  for (const polyline of polylines) {
    latest = openedRoute(polyline);
    if (latest) {
      break;
    }
  }
  if (!latest) {
    return null;
  }
  const region = regionForPoint(centerOf(latest.bounds));
  if (region !== null) {
    const matched = regions.find((item) => item.key === region);
    return { bounds: matched?.bounds ?? latest.bounds, region };
  }
  let south = latest.bounds[0][0];
  let west = latest.bounds[0][1];
  let north = latest.bounds[1][0];
  let east = latest.bounds[1][1];
  for (const polyline of polylines) {
    const route = openedRoute(polyline);
    if (!route) {
      continue;
    }
    const [startLat, startLng] = route.start;
    const [latestLat, latestLng] = latest.start;
    if (
      Math.abs(startLat - latestLat) > NEAR_DEGREES ||
      Math.abs(startLng - latestLng) > NEAR_DEGREES
    ) {
      continue;
    }
    south = Math.min(south, route.bounds[0][0]);
    west = Math.min(west, route.bounds[0][1]);
    north = Math.max(north, route.bounds[1][0]);
    east = Math.max(east, route.bounds[1][1]);
  }
  return {
    bounds: [
      [south - PAD_LAT, west - PAD_LNG],
      [north + PAD_LAT, east + PAD_LNG],
    ],
    region: null,
  };
}
