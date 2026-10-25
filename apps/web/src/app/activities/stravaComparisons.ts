import type { StravaSport } from '@dg/content-models/strava/StravaHistory';
import { formatCount, METERS_PER_MILE } from '@dg/shared-core/formatting/formattedDistance';

const EVEREST_METERS = 8849;
const SECONDS_PER_DAY = 86_400;

/** A stat said as something you can picture: `figure` is the big number, `unit` reads after it. */
export type Comparison = { figure: string; unit: string };

/**
 * Yardsticks for distance, longest first. Each one is used once the distance
 * covers it fully, except the Earth, which reads well from halfway (`0.8×`).
 */
const DISTANCE_YARDSTICKS: ReadonlyArray<{
  from: number;
  miles: number;
  times: boolean;
  unit: string;
  units?: string;
}> = [
  { from: 0.5, miles: 24_901, times: true, unit: 'around Earth' },
  { from: 1, miles: 2_800, times: true, unit: 'across the US' },
  { from: 1, miles: 382, times: true, unit: 'SF to LA' },
  { from: 1, miles: 190, times: true, unit: 'SF to Tahoe' },
  { from: 1, miles: 26.2, times: false, unit: 'marathon', units: 'marathons' },
  { from: 0, miles: 1.7, times: true, unit: 'across the Golden Gate' },
];

const tenthFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

/** `0.84` → `0.8`, `6.8` → `6.8`, `1.02` → `1`, `56.4` → `56`. */
function formatRatio(ratio: number): string {
  return ratio < 10 ? tenthFormat.format(ratio) : formatCount(ratio);
}

/** `0.8×` around Earth, `6.8×` across the US, down to `3.1` marathons or `2×` across the Golden Gate. */
export function distanceComparison(meters: number): Comparison {
  const miles = meters / METERS_PER_MILE;
  const stick =
    DISTANCE_YARDSTICKS.find((yardstick) => miles / yardstick.miles >= yardstick.from) ??
    DISTANCE_YARDSTICKS[DISTANCE_YARDSTICKS.length - 1];
  if (!stick) {
    return { figure: formatRatio(miles), unit: 'miles' };
  }
  const figure = formatRatio(miles / stick.miles);
  if (stick.times) {
    return { figure: `${figure}×`, unit: stick.unit };
  }
  return { figure, unit: figure === '1' ? stick.unit : (stick.units ?? stick.unit) };
}

/** `56` Everests climbed, `1.4` Everests, or `30%` of an Everest, all from sea level. */
export function everestComparison(meters: number): Comparison {
  const everests = meters / EVEREST_METERS;
  if (everests < 0.95) {
    return { figure: `${Math.round(everests * 100)}%`, unit: 'of an Everest' };
  }
  const figure = formatRatio(everests);
  return { figure, unit: figure === '1' ? 'Everest climbed' : 'Everests climbed' };
}

/** Moving time as days without stopping: `63` days in the saddle, or `25%` of a day for a short spell. */
export function movingTimeComparison(seconds: number, sport: StravaSport | 'all'): Comparison {
  const days = seconds / SECONDS_PER_DAY;
  const doing = sport === 'ride' ? 'in the saddle' : 'on the move';
  if (days < 0.95) {
    return { figure: `${Math.round(days * 100)}%`, unit: `of a day ${doing}` };
  }
  const figure = formatRatio(days);
  return { figure, unit: `${figure === '1' ? 'day' : 'days'} ${doing}` };
}
