import {
  type CoverageSpan,
  type CoverageSport,
  type StreetCoverage,
  coverageKey,
} from '@dg/content-models/strava/StreetCoverage';

export type NeighborhoodCoverage = {
  /** Position in `StreetCoverage.neighborhoods`, stable across filters. */
  index: number;
  name: string;
  outline: string;
  streetMeters: number;
  riddenMeters: number;
  /** Ridden share of the street length, 0 to 1. */
  share: number;
};

type CoverageSummary = {
  /** Alphabetical, matching `StreetCoverage.neighborhoods`. */
  neighborhoods: ReadonlyArray<NeighborhoodCoverage>;
  /** Most covered first, ties alphabetical. */
  ranked: ReadonlyArray<NeighborhoodCoverage>;
  city: Pick<NeighborhoodCoverage, 'riddenMeters' | 'share' | 'streetMeters'>;
  /** Neighborhoods with any street ridden. */
  explored: number;
};

const shareOf = (ridden: number, street: number) => (street > 0 ? ridden / street : 0);

/** Coverage for one sport and span, per neighborhood and for the whole city. */
export function summarizeCoverage(
  coverage: StreetCoverage,
  sport: CoverageSport,
  span: CoverageSpan,
): CoverageSummary {
  const ridden = coverage.ridden[coverageKey(sport, span)] ?? [];
  const neighborhoods = coverage.neighborhoods.map(
    ({ name, outline, streetMeters }, index): NeighborhoodCoverage => {
      const riddenMeters = ridden[index] ?? 0;
      return {
        index,
        name: name.replaceAll('/', ' / '),
        outline,
        riddenMeters,
        share: shareOf(riddenMeters, streetMeters),
        streetMeters,
      };
    },
  );
  const streetMeters = neighborhoods.reduce((sum, hood) => sum + hood.streetMeters, 0);
  const riddenMeters = neighborhoods.reduce((sum, hood) => sum + hood.riddenMeters, 0);
  return {
    city: { riddenMeters, share: shareOf(riddenMeters, streetMeters), streetMeters },
    explored: neighborhoods.filter((hood) => hood.riddenMeters > 0).length,
    neighborhoods,
    ranked: neighborhoods.toSorted((a, b) => b.share - a.share || a.name.localeCompare(b.name)),
  };
}

/** `0.4971` → `49.7%`. */
export const formatShare = (share: number) => `${(share * 100).toFixed(1)}%`;
