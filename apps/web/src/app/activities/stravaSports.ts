import type { StravaLogEntry, StravaSport } from '@dg/content-models/strava/StravaHistory';
import type { MapRoute } from '@dg/maps/src/routeFrame';
import type { PaperTone } from '../collage/types';

type SportDetails = {
  /** Chip text on a single outing. */
  label: string;
  /** Filter pill text, or null when the sport only shows under all sports. */
  filter: string | null;
  /** Paper matching the sport's ink on the map. */
  tone: PaperTone;
};

export const SPORT_DETAILS = {
  hike: { filter: 'Hikes', label: 'Hike', tone: 'viridian' },
  other: { filter: null, label: 'Activity', tone: 'ochre' },
  ride: { filter: 'Rides', label: 'Ride', tone: 'cobalt' },
  run: { filter: 'Runs', label: 'Run', tone: 'vermilion' },
  ski: { filter: 'Skiing', label: 'Ski', tone: 'rose' },
} as const satisfies Record<StravaSport, SportDetails>;

/**
 * Outings with a route as map ink in their sport's tone, rides first so the
 * rarer sports draw over them.
 */
export const toMapRoutes = (
  outings: ReadonlyArray<Pick<StravaLogEntry, 'id' | 'polyline' | 'sport'>>,
): Array<MapRoute> =>
  outings
    .toSorted((a, b) => Number(b.sport === 'ride') - Number(a.sport === 'ride'))
    .flatMap(({ id, polyline, sport }) =>
      polyline ? [{ id, polyline, tone: SPORT_DETAILS[sport].tone }] : [],
    );
