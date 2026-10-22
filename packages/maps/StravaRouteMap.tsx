import 'server-only';

import { getTileSource } from './src/getTileSource';
import { RouteMap } from './src/RouteMap';
import { decodeRoutes, frameAround, framePaths } from './src/routeFrame';

const FRAME = { height: 320, padding: 40, width: 480 };

/** One route fitted to a card, inked in vermilion. Renders nothing when the polyline has no route. */
export function StravaRouteMap({ encodedPolyline }: { encodedPolyline: string }) {
  const routes = decodeRoutes([{ id: 0, polyline: encodedPolyline, tone: 'vermilion' }]);
  const [route] = routes;
  if (!route) {
    return null;
  }
  const frame = frameAround(route.points, FRAME);
  return (
    <RouteMap
      frame={frame}
      paths={framePaths(frame, routes)}
      strokeWidth={3.5}
      tileSource={getTileSource()}
    />
  );
}
