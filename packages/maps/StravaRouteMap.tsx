import 'server-only';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import type { Point } from 'pigeon-maps';
import { getTileSource } from './src/getTileSource';
import { RouteMap } from './src/RouteMap';
import { decodePolyline } from './src/routeGeometry';

/** Server wrapper that keeps tile config out of the calling component. */
export function StravaRouteMap({
  encodedPolyline,
  surface = 'classic',
}: {
  encodedPolyline: string;
  surface?: SiteSurface;
}) {
  let points: Array<Point>;
  try {
    points = decodePolyline(encodedPolyline);
  } catch {
    return null;
  }

  if (points.length < 2) {
    return null;
  }

  return <RouteMap points={points} surface={surface} tileSource={getTileSource()} />;
}
