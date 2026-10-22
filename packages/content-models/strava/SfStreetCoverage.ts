import type { StravaSport } from './StravaHistory';

/** The rolling windows the `/strava` time filter offers, in days. */
export const STRAVA_WINDOW_DAYS = { month: 30, week: 7 } as const;

export type StravaWindow = keyof typeof STRAVA_WINDOW_DAYS;

export type SfCoverageSport = 'all' | Exclude<StravaSport, 'other'>;

/** All time, a rolling window, or a UTC calendar year. */
export type SfCoverageSpan = 'all' | StravaWindow | number;

export const sfCoverageKey = (sport: SfCoverageSport, span: SfCoverageSpan) => `${sport} ${span}`;

/** How much of San Francisco's rideable street grid the outings have covered. */
export type SfStreetCoverage = {
  /** SVG view box for every neighborhood `outline`. */
  viewBox: string;
  /**
   * Degrees to `viewBox` units, for drawing routes over the outlines:
   * `x = (lng - origin.lng) * perDegree.lng`, and `y` likewise from `lat`.
   */
  projection: {
    origin: { lat: number; lng: number };
    perDegree: { lat: number; lng: number };
  };
  /** DataSF's analysis neighborhoods, alphabetical. */
  neighborhoods: ReadonlyArray<{
    name: string;
    /** SVG path data in `viewBox` units, north up. */
    outline: string;
    /** Rideable street length inside the neighborhood. */
    streetMeters: number;
  }>;
  /**
   * Ridden street meters per neighborhood, in `neighborhoods` order, keyed by
   * `sfCoverageKey`. Rolling windows end when the history was summarized.
   * Filters that cover nothing are left out.
   */
  ridden: Readonly<Record<string, ReadonlyArray<number>>>;
};
