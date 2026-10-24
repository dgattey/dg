import type { StravaSport } from './StravaHistory';

/** The rolling windows the `/activities` time filter offers, in days. */
export const STRAVA_WINDOW_DAYS = { month: 30, week: 7 } as const;

export type StravaWindow = keyof typeof STRAVA_WINDOW_DAYS;

export type CoverageSport = 'all' | Exclude<StravaSport, 'other'>;

/** All time, a rolling window, or a UTC calendar year. */
export type CoverageSpan = 'all' | StravaWindow | number;

export const coverageKey = (sport: CoverageSport, span: CoverageSpan) => `${sport} ${span}`;

/** Cities with a measured street grid. */
export const COVERAGE_CITIES = ['sf', 'sd'] as const;

export type CoverageCity = (typeof COVERAGE_CITIES)[number];

/** How much of one city's rideable street grid the outings have covered. */
export type StreetCoverage = {
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
  /** The city's neighborhoods (or community planning areas), alphabetical. */
  neighborhoods: ReadonlyArray<{
    name: string;
    /** SVG path data in `viewBox` units, north up. */
    outline: string;
    /** Rideable street length inside the neighborhood. */
    streetMeters: number;
  }>;
  /**
   * Ridden street meters per neighborhood, in `neighborhoods` order, keyed by
   * `coverageKey`. Rolling windows end when the history was summarized.
   * Filters that cover nothing are left out.
   */
  ridden: Readonly<Record<string, ReadonlyArray<number>>>;
};
