'use client';

import {
  COVERAGE_CITIES,
  type CoverageCity,
  type StreetCoverage,
} from '@dg/content-models/strava/StreetCoverage';
import { type CSSProperties, useId, useState } from 'react';
import { PaperButton } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import { PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { useFilteredOutings } from './StravaFilters';
import { formatShare, type NeighborhoodCoverage, summarizeCoverage } from './coverageStats';
import { coverageRoutePath } from './coverageRoutePath';
import { formatMiles } from './stravaFormat';

const COLLAPSED_ROWS = 10;

const CITIES = {
  sd: { name: 'San Diego', short: 'SD', tiltDeg: 1.6 },
  sf: { name: 'San Francisco', short: 'SF', tiltDeg: -1.8 },
} as const satisfies Record<CoverageCity, { name: string; short: string; tiltDeg: number }>;
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
              onBlur={() => onHover(null)}
              onClick={() => onPick(hood.index)}
              onFocus={() => onHover(hood.index)}
              onPointerEnter={() => onHover(hood.index)}
              style={{ '--share': hood.share.toFixed(3) } as CSSProperties}
              type="button"
            >
              <span className="streets__rank">{rank + 1}</span>
              <span className="streets__name">{hood.name}</span>
              <span className="streets__share">{formatShare(hood.share)}</span>
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

/**
 * How much of a city's rideable street grid the filtered outings cover: the
 * city total, the most covered neighborhood, and a map and leaderboard of all
 * of them. Hovering or picking a neighborhood on either shows its figures, and
 * the city pills switch between San Francisco and San Diego.
 */
export function StreetCoverageSection({
  coverage: byCity,
}: {
  coverage: Readonly<Record<CoverageCity, StreetCoverage>>;
}) {
  const { outings, span, sport } = useFilteredOutings();
  const headingId = useId();
  const cities = COVERAGE_CITIES.filter((key) =>
    byCity[key].neighborhoods.some((hood) => hood.streetMeters > 0),
  );
  const [chosenCity, setCity] = useState<CoverageCity>('sf');
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const city = cities.includes(chosenCity) ? chosenCity : (cities[0] ?? chosenCity);
  const coverage = byCity[city];
  const { name: cityName, short: cityShort } = CITIES[city];
  const summary = summarizeCoverage(coverage, sport, span);
  const chooseCity = (key: CoverageCity) => {
    setCity(key);
    setHovered(null);
    setPicked(null);
  };
  const focusedIndex = hovered ?? picked;
  const focused = focusedIndex === null ? null : (summary.neighborhoods[focusedIndex] ?? null);
  const [top] = summary.ranked;
  const pick = (index: number) => setPicked(picked === index ? null : index);
  if (summary.city.streetMeters === 0) {
    return null;
  }
  return (
    <section aria-labelledby={headingId} className="streets">
      <h2 className="strava__tagHeading streets__eyebrow" id={headingId}>
        <PaperTag tiltDeg={-2} tone="black">
          {cityName} streets
        </PaperTag>
      </h2>
      {cities.length > 1 ? (
        <PaperPills
          className="streets__cities"
          label="Street coverage city"
          onSelect={chooseCity}
          options={cities.map((key) => ({
            key,
            label: CITIES[key].name,
            tiltDeg: CITIES[key].tiltDeg,
          }))}
          selected={city}
        />
      ) : null}
      <ul className="streets__callouts">
        <li className="streets__seal">
          <Scallop tiltDeg={-5} tone="cobalt">
            <span className="strava__totalNumber">{formatShare(summary.city.share)}</span>
            <span className="strava__totalUnit">of {cityShort}</span>
            <span className="strava__totalAside">{milesOf(summary.city)} ridden</span>
          </Scallop>
        </li>
        {top && top.riddenMeters > 0 ? (
          <li>
            <Stub kind="ticket" tiltDeg={1.4} tone="ochre">
              <span className="strava__totalScope">Most ridden</span>
              <span className="streets__calloutLine">
                {top.name} · {formatShare(top.share)}
              </span>
            </Stub>
          </li>
        ) : null}
        <li>
          <Stub kind="stamp" tiltDeg={-1} tone="vermilion">
            <span className="strava__totalNumber">{summary.explored}</span>
            <span className="strava__totalUnit">of {summary.neighborhoods.length}</span>
            <span className="strava__totalAside">neighborhoods explored</span>
          </Stub>
        </li>
      </ul>
      <PaperCard className="streets__mapCard" innerClassName="strava__pad" tiltDeg={-0.6}>
        <div className="streets__head">
          <h3 className="strava__heading">{focused?.name ?? cityName}</h3>
          <span className="streets__figures">
            <span className="streets__focusShare">
              {formatShare((focused ?? summary.city).share)}
            </span>
            <span className="strava__aside">{milesOf(focused ?? summary.city)}</span>
          </span>
        </div>
        <NeighborhoodMap
          focused={focused}
          neighborhoods={summary.neighborhoods}
          onHover={setHovered}
          onPick={pick}
          routes={coverageRoutePath(outings, coverage)}
          viewBox={coverage.viewBox}
        />
        <ol aria-label="Share of streets ridden" className="streets__legend">
          {TIER_FLOORS.map((floor, tier) => (
            <li className="streets__key" data-tier={tier} key={floor}>
              {Math.round(floor * 100)}%
            </li>
          ))}
        </ol>
      </PaperCard>
      <PaperCard className="streets__board" innerClassName="strava__pad" tiltDeg={0.8}>
        <h3 className="strava__heading">By neighborhood</h3>
        <Leaderboard
          focused={focused}
          onHover={setHovered}
          onPick={pick}
          picked={picked}
          ranked={summary.ranked}
        />
      </PaperCard>
    </section>
  );
}
