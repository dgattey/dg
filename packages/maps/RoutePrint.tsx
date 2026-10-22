import { RouteMap } from './src/RouteMap';
import { decodeRoutes, frameAround, framePaths } from './src/routeFrame';
import type { TileSource } from './src/tileSource';

const FRAME = { height: 320, padding: 40, width: 480 };

/** One route fitted to a card, inked in a paper `tone`. Renders nothing when the polyline has no route. */
export function RoutePrint({
  encodedPolyline,
  tileSource,
  tone,
}: {
  encodedPolyline: string;
  tileSource: TileSource;
  tone: string;
}) {
  const routes = decodeRoutes([{ id: 0, polyline: encodedPolyline, tone }]);
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
      tileSource={tileSource}
    />
  );
}
