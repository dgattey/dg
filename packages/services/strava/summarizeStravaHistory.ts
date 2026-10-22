import 'server-only';

import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import type {
  StravaBike,
  StravaHistory,
  StravaLogEntry,
  StravaOuting,
  StravaSport,
  StravaYearTotals,
} from '@dg/content-models/strava/StravaHistory';

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
  id: activity.id,
  movingTimeSeconds: activity.movingTime ?? 0,
  name: activity.name,
  polyline: activity.map?.summaryPolyline || activity.map?.polyline || null,
  sport: SPORT_BY_STRAVA_TYPE[activity.sportType ?? activity.type] ?? 'other',
  startDate: startedAt.toISOString(),
  url: activity.url,
});

const yearOf = (outing: StravaLogEntry) => new Date(outing.startDate).getUTCFullYear();

const sumOf = (outings: ReadonlyArray<StravaLogEntry>, pick: (outing: StravaLogEntry) => number) =>
  outings.reduce((total, outing) => total + pick(outing), 0);

const yearTotals = (year: number, outings: ReadonlyArray<StravaLogEntry>): StravaYearTotals => ({
  distanceMeters: sumOf(outings, (outing) => outing.distanceMeters),
  elevationGainMeters: sumOf(outings, (outing) => outing.elevationGainMeters),
  outings: outings.length,
  year,
});

const toLogEntry = ({ description: _, ...entry }: StravaOuting): StravaLogEntry => entry;

/** Strava prefixes bike ids with `b` and shoe ids with `g`. */
const bikeIdOf = ({ gear, gearId }: StravaActivity) => {
  const id = gear?.id ?? gearId;
  return id?.startsWith('b') ? id : null;
};

/**
 * Bikes from the outings ridden on them, newest first. Only fully fetched
 * activities carry the gear's name and odometer, so a bike no stored activity
 * names is left out; its rides still count once one does.
 */
const findBikes = (dated: ReadonlyArray<DatedActivity>): Array<StravaBike> => {
  const byBike = Map.groupBy(
    dated.flatMap((entry) => {
      const id = bikeIdOf(entry.activity);
      return id ? [{ ...entry, id }] : [];
    }),
    ({ id }) => id,
  );
  return [...byBike.entries()]
    .flatMap(([id, rides]): Array<StravaBike> => {
      const named = rides.find(({ activity }) => activity.gear?.name);
      const odometer = rides.find(({ activity }) => typeof activity.gear?.distance === 'number');
      const name = named?.activity.gear?.name;
      const odometerMeters = odometer?.activity.gear?.distance;
      const years = rides.map(({ startedAt }) => startedAt.getUTCFullYear());
      return name && typeof odometerMeters === 'number'
        ? [
            {
              firstYear: Math.min(...years),
              id,
              lastYear: Math.max(...years),
              name,
              odometerMeters,
              rides: rides.length,
            },
          ]
        : [];
    })
    .toSorted((a, b) => b.odometerMeters - a.odometerMeters);
};

/**
 * Folds stored activities into the history the atlas and homepage card read.
 * Years are UTC calendar buckets of `startDate`; activities without a
 * parseable start date have nowhere to go and are left out.
 */
export const summarizeStravaHistory = (
  activities: ReadonlyArray<StravaActivity>,
  now: Date,
): StravaHistory | null => {
  const dated = activities.flatMap(toDated).toSorted(newestFirst);
  const [newest] = dated;
  if (!newest) {
    return null;
  }
  const outings = dated.map((entry) => toLogEntry(toOuting(entry)));
  const currentYear = now.getUTCFullYear();
  return {
    bikes: findBikes(dated),
    latest: toOuting(newest),
    outings,
    thisYear: yearTotals(
      currentYear,
      outings.filter((outing) => yearOf(outing) === currentYear),
    ),
    totals: {
      distanceMeters: sumOf(outings, (outing) => outing.distanceMeters),
      elevationGainMeters: sumOf(outings, (outing) => outing.elevationGainMeters),
      firstYear: Math.min(...outings.map(yearOf)),
      outings: outings.length,
    },
  };
};
