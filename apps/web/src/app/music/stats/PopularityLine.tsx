import type { StatsTimelinePoint } from '@dg/services/spotify/fetchListeningStats';
import type {
  StatsPopularity,
  StatsPopularityYear,
} from '@dg/services/spotify/listeningStatsPopularity';
import { cx } from '../../collage/paperVars';
import { formatMonth, formatPercent, formatYearSpans } from './listeningStatsFormat';

/** Below this share of scored plays captured when played, a year reads current popularity. */
const AT_PLAY_MIN_SHARE = 0.5;
/** Below this share of plays with a score, the note says how many plays the line covers. */
const FULL_COVERAGE_SHARE = 0.95;

export type PopularityPoint = StatsPopularityYear & {
  popularity: number;
  /** Most of the year's plays read a score captured long after they were played. */
  usesCurrent: boolean;
};

/** Scored years keyed like the year timeline's points (`2019`). */
export function popularityByYearKey(
  popularity: StatsPopularity | null,
): Map<string, PopularityPoint> {
  const byKey = new Map<string, PopularityPoint>();
  for (const year of popularity?.years ?? []) {
    if (year.popularity !== null) {
      byKey.set(String(year.year), {
        ...year,
        popularity: year.popularity,
        usesCurrent: year.atPlayShare < AT_PLAY_MIN_SHARE,
      });
    }
  }
  return byKey;
}

export function formatPopularity(point: PopularityPoint): string {
  return `${Math.round(point.popularity)}% popularity${point.usesCurrent ? ' (current)' : ''}`;
}

/**
 * The popularity line drawn across the bar row of the year timeline. Each cell
 * spans one column and draws the segment to the next column's point, so the
 * line follows the bars' columns and gaps at any width.
 */
export function PopularityLine({
  activeKey,
  byKey,
  points,
}: {
  activeKey: string | null;
  byKey: ReadonlyMap<string, PopularityPoint>;
  points: ReadonlyArray<StatsTimelinePoint>;
}) {
  return (
    <li aria-hidden="true" className="stats__popularity">
      {points.map((point, idx) => {
        const here = byKey.get(point.key);
        const nextKey = points[idx + 1]?.key;
        const next = nextKey === undefined ? undefined : byKey.get(nextKey);
        return (
          <span className="stats__popularityCell" key={point.key}>
            {here && next ? (
              <svg
                aria-hidden="true"
                className={cx(
                  'stats__popularitySegment',
                  (here.usesCurrent || next.usesCurrent) && 'stats__popularitySegment--current',
                )}
                preserveAspectRatio="none"
                viewBox="0 0 1 100"
              >
                <line
                  vectorEffect="non-scaling-stroke"
                  x1={0}
                  x2={1}
                  y1={100 - here.popularity}
                  y2={100 - next.popularity}
                />
              </svg>
            ) : null}
            {here ? (
              <svg aria-hidden="true" className="stats__popularityPoint">
                <circle
                  className={cx(
                    'stats__popularityDot',
                    here.usesCurrent && 'stats__popularityDot--current',
                    activeKey === point.key && 'stats__popularityDot--active',
                  )}
                  cx="50%"
                  cy={`${100 - here.popularity}%`}
                  r={5.5}
                />
              </svg>
            ) : null}
          </span>
        );
      })}
    </li>
  );
}

/** Says what the line measures, which years read current popularity, and how many plays it covers. */
export function PopularityNote({
  byKey,
  points,
  popularity,
}: {
  byKey: ReadonlyMap<string, PopularityPoint>;
  points: ReadonlyArray<StatsTimelinePoint>;
  popularity: StatsPopularity;
}) {
  const currentYears = [...byKey.values()].filter((point) => point.usesCurrent);
  const totalPlays = points.reduce((sum, point) => sum + point.plays, 0);
  const scoredPlays = points.reduce(
    (sum, point) => sum + point.plays * (byKey.get(point.key)?.scoredShare ?? 0),
    0,
  );
  const measure =
    popularity.source === 'spotify'
      ? 'Spotify popularity (0–100%)'
      : 'Deezer rank, scaled to 0–100%';
  return (
    <p className="stats__popularityNote" data-typography="caption">
      <span aria-hidden="true" className="stats__popularityKey" />
      <span>
        Line: average {measure} of the songs played each year, weighted by plays.
        {currentYears.length > 0
          ? ` Dashed years (${formatYearSpans(currentYears.map((point) => point.year))}) use each song’s current popularity, tracked since ${formatMonth(popularity.firstCapturedOn.slice(0, 7))}, not what it was back then.`
          : null}
        {totalPlays > 0 && scoredPlays / totalPlays < FULL_COVERAGE_SHARE
          ? ` Scores cover ${formatPercent(scoredPlays, totalPlays, 0)} of plays so far.`
          : null}
      </span>
    </p>
  );
}
