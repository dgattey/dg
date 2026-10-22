import type { StravaOuting, StravaSport } from '@dg/content-models/strava/StravaHistory';
import { paperToneVars } from '../collage/paperVars';
import { formatDuration, formatFeet, formatMiles } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';

/** A small chip in the sport's paper, matching its ink on the maps. */
export function SportChip({ sport }: { sport: StravaSport }) {
  const { label, tone } = SPORT_DETAILS[sport];
  return (
    <span className="strava__sport" style={paperToneVars(tone)}>
      {label}
    </span>
  );
}

export function OutingStats({ outing }: { outing: StravaOuting }) {
  return (
    <span className="strava__stats">
      <span>{formatMiles(outing.distanceMeters)} mi</span>
      <span>{formatDuration(outing.movingTimeSeconds)}</span>
      <span>{formatFeet(outing.elevationGainMeters)} ft</span>
    </span>
  );
}
