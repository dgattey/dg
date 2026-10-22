import type { StravaRouteTrace, StravaSport } from '@dg/content-models/strava/StravaHistory';
import type { MapRoute } from '@dg/maps/src/routeFrame';
import type { PaperTone } from '../collage/types';

type SportDetails = {
  /** Chip text on a single outing. */
  label: string;
  /** Filter pill text, or null when the sport only shows under all routes. */
  filter: string | null;
  /** Paper matching the sport's ink on the map. */
  tone: PaperTone;
};

export const SPORT_DETAILS = {
  hike: { filter: 'Hikes', label: 'Hike', tone: 'viridian' },
  other: { filter: null, label: 'Outing', tone: 'ochre' },
  ride: { filter: 'Rides', label: 'Ride', tone: 'cobalt' },
  run: { filter: 'Runs', label: 'Run', tone: 'vermilion' },
} as const satisfies Record<StravaSport, SportDetails>;

/** Routes as map ink in their sport's tone, rides first so the rarer sports draw over them. */
export const toMapRoutes = (routes: ReadonlyArray<StravaRouteTrace>): Array<MapRoute> =>
  routes
    .toSorted((a, b) => Number(b.sport === 'ride') - Number(a.sport === 'ride'))
    .map(({ id, polyline, sport }) => ({ id, polyline, tone: SPORT_DETAILS[sport].tone }));
