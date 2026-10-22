import 'server-only';

import { getTileSource } from './src/getTileSource';
import { RouteAtlasMap } from './src/RouteAtlasMap';
import { decodeRoutes, type GeoBounds, homeBounds, type MapRoute } from './src/routeFrame';
import { encodePolyline, simplifyLine } from './src/routeGeometry';

/** About 20 m: invisible at city zoom, and it halves what the page ships for every route. */
const SIMPLIFY_DEGREES = 2e-4;

const BAY_AREA: GeoBounds = [
  [37.35, -122.8],
  [38.12, -121.85],
];

/**
 * Every route on an interactive Stadia map, opening on where most of them
 * start. Routes are simplified here so the browser decodes far fewer points.
 */
export function RouteAtlas({ label, routes }: { label: string; routes: ReadonlyArray<MapRoute> }) {
  const decoded = decodeRoutes(routes);
  return (
    <RouteAtlasMap
      bounds={homeBounds(decoded) ?? BAY_AREA}
      label={label}
      routes={decoded.map(({ id, points, tone }) => ({
        id,
        polyline: encodePolyline(
          simplifyLine(points, SIMPLIFY_DEGREES, ([latitude, longitude]) => [longitude, latitude]),
        ),
        tone,
      }))}
      tileSource={getTileSource()}
    />
  );
}
