import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import type {
  StravaHistory,
  StravaOdometer,
  StravaOuting,
  StravaRouteTrace,
  StravaSport,
  StravaYearTotals,
} from '@dg/content-models/strava/StravaHistory';

const LISTED_OUTINGS = 6;

const MONTHS_PER_YEAR = 12;

const SPORT_BY_STRAVA_TYPE: Partial<Record<string, StravaSport>> = {
  EBikeRide: 'ride',
  GravelRide: 'ride',
  Handcycle: 'ride',
  Hike: 'hike',
  MountainBikeRide: 'ride',
  Ride: 'ride',
  Run: 'run',
  TrailRun: 'run',
  Velomobile: 'ride',
  VirtualRide: 'ride',
  VirtualRun: 'run',
  Walk: 'hike',
};

type DatedActivity = { activity: StravaActivity; startedAt: Date };

/** The token has `activity:read_all`, so private and followers-only activities are stored too. */
const isPublic = (activity: StravaActivity) =>
  !activity.private && (activity.visibility ?? 'everyone') === 'everyone';

const toDated = (activity: StravaActivity): Array<DatedActivity> => {
  if (!isPublic(activity)) {
    return [];
  }
  const startedAt = activity.startDate ? new Date(activity.startDate) : null;
  return startedAt && !Number.isNaN(startedAt.getTime()) ? [{ activity, startedAt }] : [];
};

const newestFirst = (a: DatedActivity, b: DatedActivity) =>
  b.startedAt.getTime() - a.startedAt.getTime() || b.activity.id - a.activity.id;

const toOuting = ({ activity, startedAt }: DatedActivity): StravaOuting => ({
  description: activity.description?.trim() || null,
  distanceMeters: activity.distance ?? 0,
  elevationGainMeters: activity.totalElevationGain ?? 0,
  gearName: activity.gear?.name ?? null,
  id: activity.id,
  movingTimeSeconds: activity.movingTime ?? 0,
  name: activity.name,
  polyline: activity.map?.summaryPolyline || activity.map?.polyline || null,
  sport: SPORT_BY_STRAVA_TYPE[activity.sportType ?? activity.type] ?? 'other',
  startDate: startedAt.toISOString(),
  url: activity.url,
});

const toOdometer = ({ activity: { gear } }: DatedActivity): StravaOdometer | null =>
  gear?.name && typeof gear.distance === 'number'
    ? { distanceMeters: gear.distance, gearName: gear.name }
    : null;

const yearOf = (outing: StravaOuting) => new Date(outing.startDate).getUTCFullYear();

const monthOf = (outing: StravaOuting) => new Date(outing.startDate).getUTCMonth();

const sumOf = (outings: ReadonlyArray<StravaOuting>, pick: (outing: StravaOuting) => number) =>
  outings.reduce((total, outing) => total + pick(outing), 0);

const yearTotals = (year: number, outings: ReadonlyArray<StravaOuting>): StravaYearTotals => ({
  distanceMeters: sumOf(outings, (outing) => outing.distanceMeters),
  elevationGainMeters: sumOf(outings, (outing) => outing.elevationGainMeters),
  outings: outings.length,
  year,
});

const groupByYear = (outings: ReadonlyArray<StravaOuting>) => {
  const byYear = new Map<number, Array<StravaOuting>>();
  for (const outing of outings) {
    const year = yearOf(outing);
    const yearOutings = byYear.get(year);
    if (yearOutings) {
      yearOutings.push(outing);
    } else {
      byYear.set(year, [outing]);
    }
  }
  return byYear;
};

const findOdometer = (dated: ReadonlyArray<DatedActivity>): StravaOdometer | null => {
  for (const entry of dated) {
    const odometer = toOdometer(entry);
    if (odometer) {
      return odometer;
    }
  }
  return null;
};

/**
 * Folds stored activities into the history the atlas and homepage card read.
 * Years and months are UTC calendar buckets of `startDate`; activities without
 * a parseable start date have nowhere to go and are left out.
 */
export const summarizeStravaHistory = (
  activities: ReadonlyArray<StravaActivity>,
  now: Date,
): StravaHistory | null => {
  const dated = activities.flatMap(toDated).toSorted(newestFirst);
  const outings = dated.map(toOuting);
  const [latest] = outings;
  if (!latest) {
    return null;
  }

  const byYear = groupByYear(outings);
  const currentYear = now.getUTCFullYear();
  const thisYearOutings = byYear.get(currentYear) ?? [];
  const routes = outings.flatMap(
    (outing): Array<StravaRouteTrace> =>
      outing.polyline
        ? [{ id: outing.id, polyline: outing.polyline, sport: outing.sport, year: yearOf(outing) }]
        : [],
  );

  return {
    biggestClimbs: outings
      .filter((outing) => outing.elevationGainMeters > 0)
      .toSorted((a, b) => b.elevationGainMeters - a.elevationGainMeters)
      .slice(0, LISTED_OUTINGS),
    latest,
    longest: outings.reduce(
      (longest, outing) => (outing.distanceMeters > longest.distanceMeters ? outing : longest),
      latest,
    ),
    monthlyClimbingMeters: Array.from({ length: MONTHS_PER_YEAR }, (_, month) =>
      sumOf(
        thisYearOutings.filter((outing) => monthOf(outing) === month),
        (outing) => outing.elevationGainMeters,
      ),
    ),
    odometer: findOdometer(dated),
    recent: outings.slice(0, LISTED_OUTINGS),
    routes,
    thisYear: yearTotals(currentYear, thisYearOutings),
    totals: {
      distanceMeters: sumOf(outings, (outing) => outing.distanceMeters),
      elevationGainMeters: sumOf(outings, (outing) => outing.elevationGainMeters),
      firstYear: Math.min(...byYear.keys()),
      outings: outings.length,
    },
    years: [...byYear.entries()]
      .map(([year, yearOutings]) => yearTotals(year, yearOutings))
      .toSorted((a, b) => a.year - b.year),
  };
};
