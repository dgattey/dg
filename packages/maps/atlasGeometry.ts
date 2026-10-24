import 'server-only';

import {
  boundsWithin,
  decodeRoutes,
  type GeoBounds,
  homeBounds,
  type MapRoute,
} from './src/routeFrame';

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

export const atlasRegions = (routes: ReadonlyArray<MapRoute>): Array<AtlasRegion> => {
  const decoded = decodeRoutes(routes);
  return ATLAS_REGIONS.flatMap(({ box, key, label }) => {
    const bounds = boundsWithin(decoded, box);
    return bounds ? [{ bounds, key, label }] : [];
  });
};
