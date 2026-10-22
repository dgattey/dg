export const STRAVA_SPORTS = ['ride', 'run', 'hike', 'other'] as const;

export type StravaSport = (typeof STRAVA_SPORTS)[number];

/** One stored activity, flattened to the fields the history views read. */
export type StravaOuting = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  sport: StravaSport;
  /** ISO UTC timestamp. */
  startDate: string;
  distanceMeters: number;
  elevationGainMeters: number;
  movingTimeSeconds: number;
  gearName: string | null;
  /** Encoded Google polyline (summary resolution), or null when Strava stored none. */
  polyline: string | null;
};

export type StravaRouteTrace = {
  id: number;
  sport: StravaSport;
  year: number;
  polyline: string;
};

export type StravaYearTotals = {
  year: number;
  distanceMeters: number;
  elevationGainMeters: number;
  outings: number;
};

export type StravaOdometer = {
  gearName: string;
  distanceMeters: number;
};

export type StravaHistory = {
  latest: StravaOuting;
  /** Newest first, at most six, starting with `latest`. */
  recent: ReadonlyArray<StravaOuting>;
  /** At most six outings with the most elevation gain, biggest first. */
  biggestClimbs: ReadonlyArray<StravaOuting>;
  longest: StravaOuting;
  /** Every outing that has a polyline, newest first. */
  routes: ReadonlyArray<StravaRouteTrace>;
  totals: {
    distanceMeters: number;
    elevationGainMeters: number;
    outings: number;
    firstYear: number;
  };
  /** The calendar year of `now`, zeroed when nothing happened yet this year. */
  thisYear: StravaYearTotals;
  /** Every year with at least one outing, oldest first. */
  years: ReadonlyArray<StravaYearTotals>;
  /** Elevation gain per month (index 0 is January) for `thisYear.year`. */
  monthlyClimbingMeters: ReadonlyArray<number>;
  /** Lifetime distance on the gear used most recently, from Strava's gear odometer. */
  odometer: StravaOdometer | null;
};
