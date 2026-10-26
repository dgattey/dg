import type { CoverageCity } from '@dg/content-models/strava/StreetCoverage';
import { latestRouteView } from '@dg/maps/atlasGeometry';
import type { GeoBounds } from '@dg/maps/src/routeFrame';

export type AtlasFocus =
  | { kind: 'region'; city: CoverageCity }
  | { kind: 'place'; bounds: GeoBounds };

export function atlasFocusFor(
  resetHome: boolean,
  polylines: ReadonlyArray<string>,
): AtlasFocus | null {
  if (resetHome) {
    return { city: 'sf', kind: 'region' };
  }
  const view = latestRouteView(polylines, []);
  if (!view) {
    return null;
  }
  if (view.region) {
    return { city: view.region, kind: 'region' };
  }
  return { bounds: view.bounds, kind: 'place' };
}
