import type { StravaSport } from '@dg/content-models/strava/StravaHistory';
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
  other: { filter: null, label: 'Outing', tone: 'rose' },
  ride: { filter: 'Rides', label: 'Ride', tone: 'vermilion' },
  run: { filter: 'Runs', label: 'Run', tone: 'cobalt' },
} as const satisfies Record<StravaSport, SportDetails>;
