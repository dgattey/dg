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
import { measureCityCoverage } from './measureStreetCoverage';

const SPORT_BY_STRAVA_TYPE: Partial<Record<string, StravaSport>> = {
  AlpineSki: 'ski',
  BackcountrySki: 'ski',
  EBikeRide: 'ride',
  GravelRide: 'ride',
  Handcycle: 'ride',
  Hike: 'hike',
  MountainBikeRide: 'ride',
  NordicSki: 'ski',
  Ride: 'ride',
  RollerSki: 'ski',
  Run: 'run',
  Ski: 'ski',
  Snowboard: 'ski',
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

/** Totals per UTC year across the rides' span, so quiet years show up as gaps. */
const yearlyRides = (rides: ReadonlyArray<StravaLogEntry>): StravaBike['years'] => {
  const years = rides.map(yearOf);
  const first = Math.min(...years);
  return Array.from({ length: Math.max(...years) - first + 1 }, (_, index) => {
    const year = first + index;
    const inYear = rides.filter((ride) => yearOf(ride) === year);
    return {
      distanceMeters: sumOf(inYear, (ride) => ride.distanceMeters),
      elevationGainMeters: sumOf(inYear, (ride) => ride.elevationGainMeters),
      movingTimeSeconds: sumOf(inYear, (ride) => ride.movingTimeSeconds),
      rides: inYear.length,
      year,
    };
  });
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
    .flatMap(([id, entries]): Array<StravaBike> => {
      const name = entries.find(({ activity }) => activity.gear?.name)?.activity.gear?.name;
      const odometerMeters = entries.find(
        ({ activity }) => typeof activity.gear?.distance === 'number',
      )?.activity.gear?.distance;
      const rides = entries.map((entry) => toLogEntry(toOuting(entry)));
      const longest = rides.reduce((best, ride) =>
        ride.distanceMeters > best.distanceMeters ? ride : best,
      );
      return name && typeof odometerMeters === 'number'
        ? [
            {
              elevationGainMeters: sumOf(rides, (ride) => ride.elevationGainMeters),
              id,
              longest: {
                distanceMeters: longest.distanceMeters,
                name: longest.name,
                startDate: longest.startDate,
                url: longest.url,
              },
              movingTimeSeconds: sumOf(rides, (ride) => ride.movingTimeSeconds),
              name,
              odometerMeters,
              rides: rides.length,
              years: yearlyRides(rides),
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
    streetCoverage: measureCityCoverage(outings, now),
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
