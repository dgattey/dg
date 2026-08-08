import 'server-only';

import type { Point } from 'pigeon-maps';
import { RouteMap } from './src/RouteMap';
import { decodePolyline } from './src/routeGeometry';

/** Server wrapper that keeps the Stadia key out of the calling component. */
export function StravaRouteMap({ encodedPolyline }: { encodedPolyline: string }) {
  let points: Array<Point>;
  try {
    points = decodePolyline(encodedPolyline);
  } catch {
    return null;
  }

  if (points.length < 2) {
    return null;
  }

  return <RouteMap points={points} stadiaApiKey={process.env.STADIA_API_KEY ?? ''} />;
}
