import type { StravaLogEntry, StravaYearTotals } from '@dg/content-models/strava/StravaHistory';

const MONTHS_PER_YEAR = 12;

type OutingTotals = Omit<StravaYearTotals, 'year'> & { movingTimeSeconds: number };

/** Years and months are UTC calendar buckets of `startDate`, matching the stored history. */
export const yearOf = (outing: Pick<StravaLogEntry, 'startDate'>) =>
  new Date(outing.startDate).getUTCFullYear();

const monthOf = (outing: Pick<StravaLogEntry, 'startDate'>) =>
  new Date(outing.startDate).getUTCMonth();

export const totalsOf = (outings: ReadonlyArray<StravaLogEntry>): OutingTotals => ({
  distanceMeters: outings.reduce((sum, outing) => sum + outing.distanceMeters, 0),
  elevationGainMeters: outings.reduce((sum, outing) => sum + outing.elevationGainMeters, 0),
  movingTimeSeconds: outings.reduce((sum, outing) => sum + outing.movingTimeSeconds, 0),
  outings: outings.length,
});

/** Every year with an outing, oldest first. */
export function yearlyTotals(outings: ReadonlyArray<StravaLogEntry>): Array<StravaYearTotals> {
  const byYear = Map.groupBy(outings, yearOf);
  return [...byYear.entries()]
    .map(([year, yearOutings]) => ({ ...totalsOf(yearOutings), year }))
    .toSorted((a, b) => a.year - b.year);
}

/** Elevation gain per calendar month (index 0 is January), summed across years. */
export const monthlyClimbing = (outings: ReadonlyArray<StravaLogEntry>): Array<number> =>
  outings.reduce(
    (months, outing) => {
      const month = monthOf(outing);
      months[month] = (months[month] ?? 0) + outing.elevationGainMeters;
      return months;
    },
    Array.from({ length: MONTHS_PER_YEAR }, () => 0),
  );

/** The `count` outings that climbed the most, skipping flat ones. */
export const biggestClimbs = <T extends StravaLogEntry>(outings: ReadonlyArray<T>, count: number) =>
  outings
    .filter((outing) => outing.elevationGainMeters > 0)
    .toSorted((a, b) => b.elevationGainMeters - a.elevationGainMeters)
    .slice(0, count);

/** The `count` longest outings by distance, skipping ones with no distance. */
export const longestOutings = <T extends StravaLogEntry>(
  outings: ReadonlyArray<T>,
  count: number,
) =>
  outings
    .filter((outing) => outing.distanceMeters > 0)
    .toSorted((a, b) => b.distanceMeters - a.distanceMeters)
    .slice(0, count);
