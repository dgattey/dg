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
  /** Encoded Google polyline (summary resolution), or null when Strava stored none. */
  polyline: string | null;
};

/** An outing in the full log, which leaves notes to `latest` to keep the log light. */
export type StravaLogEntry = Omit<StravaOuting, 'description'>;

export type StravaYearTotals = {
  year: number;
  distanceMeters: number;
  elevationGainMeters: number;
  outings: number;
};

/** A named bike, with Strava's odometer for it and what the stored rides on it add up to. */
export type StravaBike = {
  id: string;
  name: string;
  odometerMeters: number;
  rides: number;
  elevationGainMeters: number;
  movingTimeSeconds: number;
  longest: Pick<StravaLogEntry, 'distanceMeters' | 'name' | 'startDate' | 'url'>;
  /** Miles per UTC year from the first ride's year to the last's, oldest first, gaps zeroed. */
  years: ReadonlyArray<{ year: number; distanceMeters: number }>;
};

export type StravaHistory = {
  latest: StravaOuting;
  /** Every outing, newest first, starting with `latest`. */
  outings: ReadonlyArray<StravaLogEntry>;
  totals: {
    distanceMeters: number;
    elevationGainMeters: number;
    outings: number;
    firstYear: number;
  };
  /** The calendar year of `now`, zeroed when nothing happened yet this year. */
  thisYear: StravaYearTotals;
  /** Bikes Strava has named, most miles first. */
  bikes: ReadonlyArray<StravaBike>;
};
