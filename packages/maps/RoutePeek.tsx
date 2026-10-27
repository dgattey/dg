import 'server-only';

import { getTileSource } from './src/getTileSource';
import { RouteMap } from './src/RouteMap';
import {
  decodeRoutes,
  frameAround,
  frameHeatmap,
  homeBounds,
  type MapRoute,
} from './src/routeFrame';

const FRAME = { height: 300, padding: 16, width: 426 };

/**
 * A card-sized glimpse of every route around where most of them start, inked
 * with the Option D (Collage Ink & Ice) 4-step frequency heatmap.
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
      paths={frameHeatmap(frame, decoded)}
      strokeWidth={1.6}
      tileSource={getTileSource()}
    />
  );
}
