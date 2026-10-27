import 'server-only';

import { getTileSource } from './src/getTileSource';
import { RouteMap } from './src/RouteMap';
import { decodeRoutes, frameAround, framePaths, homeBounds, type MapRoute } from './src/routeFrame';

const FRAME = { height: 300, padding: 16, width: 426 };

/**
 * A card-sized glimpse of every route around where most of them start. Paths
 * are projected here so the page ships one short path per tone, not polylines.
 */
export function RoutePeek({ routes }: { routes: ReadonlyArray<MapRoute> }) {
  const decoded = decodeRoutes(routes);
  const bounds = homeBounds(decoded);
  if (!bounds) {
    return null;
  }
  const frame = frameAround(bounds, FRAME);
  return (
    <RouteMap
      frame={frame}
      paths={framePaths(frame, decoded)}
      strokeWidth={1.8}
      tileSource={getTileSource()}
    />
  );
}
