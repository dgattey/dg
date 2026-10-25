'use client';

import {
  COVERAGE_CITIES,
  type CoverageCity,
  type StreetCoverage,
} from '@dg/content-models/strava/StreetCoverage';
import { type CSSProperties, useId, useRef, useState } from 'react';
import { PaperButton } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import { PaperStrip } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { coverageRoutePath } from './coverageRoutePath';
import { formatShare, type NeighborhoodCoverage, summarizeCoverage } from './coverageStats';
import { useFilteredOutings } from './StravaFilters';
import { formatMiles } from './stravaFormat';

const COLLAPSED_ROWS = 10;

const CITIES = {
  sd: { name: 'San Diego', short: 'SD' },
  sf: { name: 'San Francisco', short: 'SF' },
} as const satisfies Record<CoverageCity, { name: string; short: string }>;
/** Lower bounds of each fill tier, cream through viridian. */
const TIER_FLOORS = [0, 0.1, 0.25, 0.5, 0.75] as const;

const tierOf = (share: number) => TIER_FLOORS.filter((floor) => share >= floor).length - 1;

/** The neighborhood a map event landed on, read from the shape's `data-index`. */
const neighborhoodAt = (target: EventTarget) => {
  const index = target instanceof Element ? target.getAttribute('data-index') : null;
  return index === null ? null : Number(index);
};

const milesOf = ({
  riddenMeters,
  streetMeters,
}: Pick<NeighborhoodCoverage, 'riddenMeters' | 'streetMeters'>) =>
  `${formatMiles(riddenMeters)} of ${formatMiles(streetMeters)} mi`;

/**
 * A paper-cut map of the neighborhoods, filled by how much of each is ridden,
 * with the routes traced over the land and under the cuts between pieces.
 * Pointer only: the leaderboard beside it is the keyboard and screen reader path.
 */
function NeighborhoodMap({
  focused,
  neighborhoods,
  onHover,
  onPick,
  routes,
  viewBox,
}: {
  focused: NeighborhoodCoverage | null;
  neighborhoods: ReadonlyArray<NeighborhoodCoverage>;
  onHover: (index: number | null) => void;
  onPick: (index: number) => void;
  routes: string;
  viewBox: string;
}) {
  const landId = useId();
  const land = neighborhoods.map((hood) => hood.outline).join('');
  return (
    <svg
      aria-hidden="true"
      className="streets__map"
      onClick={(event) => {
        const index = neighborhoodAt(event.target);
        if (index !== null) {
          onPick(index);
        }
      }}
      onPointerLeave={() => onHover(null)}
      onPointerOver={(event) => onHover(neighborhoodAt(event.target))}
      viewBox={viewBox}
    >
      <path className="streets__hoodShadow" d={land} transform="translate(0 1.5)" />
      <g className="streets__hoods">
        {neighborhoods.map((hood) => (
          <path
            className="streets__hood"
            d={hood.outline}
            data-index={hood.index}
            data-tier={tierOf(hood.share)}
            key={hood.index}
          />
        ))}
      </g>
      {routes ? (
        <>
          <clipPath id={landId}>
            <path d={land} />
          </clipPath>
          <path className="streets__routes" clipPath={`url(#${landId})`} d={routes} />
        </>
      ) : null}
      <path className="streets__cuts" d={land} />
      {focused ? <path className="streets__focus" d={focused.outline} /> : null}
    </svg>
  );
}

function Leaderboard({
  focused,
  onHover,
  onPick,
  picked,
  ranked,
}: {
  focused: NeighborhoodCoverage | null;
  onHover: (index: number | null) => void;
  onPick: (index: number) => void;
  picked: number | null;
  ranked: ReadonlyArray<NeighborhoodCoverage>;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? ranked : ranked.slice(0, COLLAPSED_ROWS);
  return (
    <>
      <ol className="streets__rows" onPointerLeave={() => onHover(null)}>
        {rows.map((hood, rank) => (
          <li key={hood.index}>
            <button
              aria-pressed={picked === hood.index}
              className="streets__row"
              data-focused={focused?.index === hood.index}
              data-tier={tierOf(hood.share)}
              data-typography="row-title"
              onBlur={() => onHover(null)}
              onClick={() => onPick(hood.index)}
              onFocus={() => onHover(hood.index)}
              onPointerEnter={() => onHover(hood.index)}
              style={{ '--share': hood.share.toFixed(3) } as CSSProperties}
              type="button"
            >
              <span className="streets__rank">{rank + 1}</span>
              <span className="streets__name">{hood.name}</span>
              <span>{formatShare(hood.share)}</span>
              <span aria-hidden="true" className="streets__bar" />
            </button>
          </li>
        ))}
      </ol>
      {ranked.length > COLLAPSED_ROWS ? (
        <div className="streets__more">
          <PaperButton
            expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            tiltDeg={-1.2}
            tone="ochre"
          >
            {expanded ? `Top ${COLLAPSED_ROWS}` : `All ${ranked.length} neighborhoods`}
          </PaperButton>
        </div>
      ) : null}
    </>
  );
}

export function StreetCoverageSection({
  coverage: byCity,
}: {
  coverage: Readonly<Record<CoverageCity, StreetCoverage>>;
}) {
  const { city: chosenCity, outings, setCity, span, sport } = useFilteredOutings();
  const headingId = useId();
  const cities = COVERAGE_CITIES.filter((key) =>
    byCity[key].neighborhoods.some((hood) => hood.streetMeters > 0),
  );
  const city = cities.includes(chosenCity) ? chosenCity : (cities[0] ?? chosenCity);
  const coverage = byCity[city];
  const { name: cityName, short: cityShort } = CITIES[city];
  const cacheRef = useRef<{
    coverage: StreetCoverage;
    outings: typeof outings;
    routes: string;
    span: typeof span;
    sport: typeof sport;
    summary: ReturnType<typeof summarizeCoverage>;
  } | null>(null);
  if (
    !cacheRef.current ||
    cacheRef.current.outings !== outings ||
    cacheRef.current.coverage !== coverage ||
    cacheRef.current.sport !== sport ||
    cacheRef.current.span !== span
  ) {
    cacheRef.current = {
      coverage,
      outings,
      routes: coverageRoutePath(outings, coverage),
      span,
      sport,
      summary: summarizeCoverage(coverage, sport, span),
    };
  }
  const { routes, summary } = cacheRef.current;
  if (summary.city.streetMeters === 0) {
    return null;
  }
  const [top] = summary.ranked;
  return (
    <section aria-labelledby={headingId} className="streets">
      <div className="streets__eyebrow">
        <h2 className="strava__tagHeading" id={headingId}>
          <PaperTag tiltDeg={-2} tone="black">
            {cityName} streets
          </PaperTag>
        </h2>
        {cities.length > 1 ? (
          <PaperStrip
            className="streets__cities"
            label="Street coverage city"
            onSelect={setCity}
            options={cities.map((key) => ({ key, label: CITIES[key].name }))}
            selected={city}
          />
        ) : null}
      </div>
      <ul className="streets__callouts">
        <li className="streets__seal">
          <Scallop tiltDeg={-5} tone="cobalt">
            <span className="strava__totalNumber" data-typography="stat-lg">
              {formatShare(summary.city.share)}
            </span>
            <span data-typography="label">of {cityShort}</span>
            <span className="strava__totalAside" data-typography="caption">
              {milesOf(summary.city)} ridden
            </span>
          </Scallop>
        </li>
        {top && top.riddenMeters > 0 ? (
          <li>
            <Stub kind="ticket" size="compact" tiltDeg={1.4} tone="ochre">
              <span className="strava__totalScope" data-typography="caption">
                Most ridden
              </span>
              <span data-typography="stat-md">
                {top.name} · {formatShare(top.share)}
              </span>
            </Stub>
          </li>
        ) : null}
        <li>
          <Stub kind="stamp" size="compact" tiltDeg={-1} tone="vermilion">
            <span className="strava__totalNumber" data-typography="stat-lg">
              {summary.explored}
            </span>
            <span data-typography="label">of {summary.neighborhoods.length}</span>
            <span className="strava__totalAside" data-typography="caption">
              neighborhoods explored
            </span>
          </Stub>
        </li>
      </ul>
      <CityCoverageCards
        cityName={cityName}
        key={city}
        routes={routes}
        summary={summary}
        viewBox={coverage.viewBox}
      />
    </section>
  );
}

function CityCoverageCards({
  cityName,
  routes,
  summary,
  viewBox,
}: {
  cityName: string;
  routes: string;
  summary: ReturnType<typeof summarizeCoverage>;
  viewBox: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const focusedIndex = hovered ?? picked;
  const focused = focusedIndex === null ? null : (summary.neighborhoods[focusedIndex] ?? null);
  const pick = (index: number) => setPicked(picked === index ? null : index);
  return (
    <>
      <PaperCard className="streets__mapCard" innerClassName="strava__pad" tiltDeg={-0.6}>
        <div className="streets__head">
          <h3 className="strava__heading" data-typography="title-md">
            {focused?.name ?? cityName}
          </h3>
          <span className="streets__figures">
            <span className="streets__focusShare" data-typography="stat-md">
              {formatShare((focused ?? summary.city).share)}
            </span>
            <span className="strava__aside" data-typography="row-title">
              {milesOf(focused ?? summary.city)}
            </span>
          </span>
        </div>
        <NeighborhoodMap
          focused={focused}
          neighborhoods={summary.neighborhoods}
          onHover={setHovered}
          onPick={pick}
          routes={routes}
          viewBox={viewBox}
        />
        <ol aria-label="Share of streets ridden" className="streets__legend">
          {TIER_FLOORS.map((floor, tier) => (
            <li className="streets__key" data-tier={tier} data-typography="caption" key={floor}>
              {Math.round(floor * 100)}%
            </li>
          ))}
        </ol>
      </PaperCard>
      <PaperCard className="streets__board" innerClassName="strava__pad" tiltDeg={0.8}>
        <h3 className="strava__heading" data-typography="title-md">
          By neighborhood
        </h3>
        <Leaderboard
          focused={focused}
          onHover={setHovered}
          onPick={pick}
          picked={picked}
          ranked={summary.ranked}
        />
      </PaperCard>
    </>
  );
}
