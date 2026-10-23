import {
  type SfCoverageSpan,
  type SfCoverageSport,
  type SfStreetCoverage,
  sfCoverageKey,
} from '@dg/content-models/strava/SfStreetCoverage';

export type SfNeighborhoodCoverage = {
  /** Position in `SfStreetCoverage.neighborhoods`, stable across filters. */
  index: number;
  name: string;
  outline: string;
  streetMeters: number;
  riddenMeters: number;
  /** Ridden share of the street length, 0 to 1. */
  share: number;
};

type SfCoverageSummary = {
  /** Alphabetical, matching `SfStreetCoverage.neighborhoods`. */
  neighborhoods: ReadonlyArray<SfNeighborhoodCoverage>;
  /** Most covered first, ties alphabetical. */
  ranked: ReadonlyArray<SfNeighborhoodCoverage>;
  city: Pick<SfNeighborhoodCoverage, 'riddenMeters' | 'share' | 'streetMeters'>;
  /** Neighborhoods with any street ridden. */
  explored: number;
};

const shareOf = (ridden: number, street: number) => (street > 0 ? ridden / street : 0);

/** Coverage for one sport and span, per neighborhood and for the whole city. */
export function summarizeSfCoverage(
  coverage: SfStreetCoverage,
  sport: SfCoverageSport,
  span: SfCoverageSpan,
): SfCoverageSummary {
  const ridden = coverage.ridden[sfCoverageKey(sport, span)] ?? [];
  const neighborhoods = coverage.neighborhoods.map(
    ({ name, outline, streetMeters }, index): SfNeighborhoodCoverage => {
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
