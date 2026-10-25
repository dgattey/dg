'use client';

import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import {
  type CoverageCity,
  type CoverageSpan,
  STRAVA_WINDOW_DAYS,
  type StravaWindow,
} from '@dg/content-models/strava/StreetCoverage';
import { regionForPoint } from '@dg/maps/atlasGeometry';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import { VisibleRoutes } from '@dg/maps/VisibleRoutes';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  startTransition,
  use,
  useState,
} from 'react';
import { FilterBar } from '../collage/FilterBar';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { PillMenu, PillMenuList, PillMenuOption } from '../collage/PillMenu';
import { YearGrid, YearMenu } from '../collage/YearMenu';
import { type AtlasFocus, atlasFocusFor } from './atlasFocus';
import { formatRouteCount } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';
import { yearOf } from './stravaStats';

const FILTER_SPORTS = ['ride', 'ski', 'hike', 'run'] as const;
const PHONE_SPORT_PILLS = 2;

type SportFilter = 'all' | (typeof FILTER_SPORTS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

type Span =
  | { kind: 'all' }
  | { kind: 'window'; key: StravaWindow; since: number }
  | { kind: 'year'; year: number };

type SpanKey = 'all' | StravaWindow;

const WINDOW_LABELS = {
  month: 'This month',
  week: 'This week',
} as const satisfies Record<StravaWindow, string>;

const WINDOW_SHORT_LABELS = {
  month: 'Month',
  week: 'Week',
} as const satisfies Record<StravaWindow, string>;

const SPAN_OPTIONS = [
  { className: 'pillPhoneHidden', key: 'all', label: 'All time', tiltDeg: 0.8 },
  { className: 'pillPhoneHidden', key: 'week', label: WINDOW_LABELS.week, tiltDeg: -1.2 },
  { className: 'pillPhoneHidden', key: 'month', label: WINDOW_LABELS.month, tiltDeg: 0.6 },
] as const satisfies ReadonlyArray<PaperPillOption<SpanKey>>;

const SPORT_TILTS = [-1, 1.2, -0.6, 0.9] as const;

type Filtered = {
  all: ReadonlyArray<StravaLogEntry>;
  atlasCustomBounds: GeoBounds | null;
  atlasRegion: CoverageCity | null;
  city: CoverageCity;
  fitKey: number;
  followAtlasCenter: (center: [number, number]) => void;
  framedRegion: CoverageCity | null;
  outings: ReadonlyArray<StravaLogEntry>;
  selectRegion: (city: CoverageCity) => void;
  setCity: (city: CoverageCity) => void;
  sportOutings: ReadonlyArray<StravaLogEntry>;
  sport: SportFilter;
  spanLabel: string;
  span: CoverageSpan;
};

const FilteredOutings = createContext<Filtered>({
  all: [],
  atlasCustomBounds: null,
  atlasRegion: 'sf',
  city: 'sf',
  fitKey: 0,
  followAtlasCenter: () => {},
  framedRegion: 'sf',
  outings: [],
  selectRegion: () => {},
  setCity: () => {},
  span: 'all',
  spanLabel: SPAN_OPTIONS[0].label,
  sport: 'ride',
  sportOutings: [],
});

export const useFilteredOutings = () => use(FilteredOutings);

const sportLabel = (key: SportFilter) =>
  key === 'all' ? (
    'All sports'
  ) : (
    <span>
      <span
        aria-hidden="true"
        className="strava__filterDot"
        style={{ '--dot-bg': `var(--${SPORT_DETAILS[key].tone})` } as CSSProperties}
      />
      {SPORT_DETAILS[key].filter}
    </span>
  );

function inSpan(span: Span, outing: StravaLogEntry) {
  switch (span.kind) {
    case 'all':
      return true;
    case 'window':
      return Date.parse(outing.startDate) >= span.since - STRAVA_WINDOW_DAYS[span.key] * DAY_MS;
    case 'year':
      return yearOf(outing) === span.year;
    default: {
      const unhandled: never = span;
      return unhandled;
    }
  }
}

function spanLabel(span: Span, labels: Record<StravaWindow, string> = WINDOW_LABELS) {
  switch (span.kind) {
    case 'all':
      return SPAN_OPTIONS[0].label;
    case 'window':
      return labels[span.key];
    case 'year':
      return String(span.year);
    default: {
      const unhandled: never = span;
      return unhandled;
    }
  }
}

export function StravaFilters({
  children,
  outings,
}: {
  children: ReactNode;
  outings: ReadonlyArray<StravaLogEntry>;
}) {
  const sports = FILTER_SPORTS.filter((key) => outings.some((outing) => outing.sport === key));
  const sportKeys: ReadonlyArray<SportFilter> = [...sports, 'all'];
  const foldedSports =
    sportKeys.length > PHONE_SPORT_PILLS + 1 ? sportKeys.slice(PHONE_SPORT_PILLS) : [];
  const [sport, setSport] = useState<SportFilter>(() => (sports.includes('ride') ? 'ride' : 'all'));
  const [span, setSpan] = useState<Span>({ kind: 'all' });
  const [city, setCityState] = useState<CoverageCity>('sf');
  const [atlasRegion, setAtlasRegion] = useState<CoverageCity | null>('sf');
  const [atlasCustomBounds, setAtlasCustomBounds] = useState<GeoBounds | null>(null);
  const [framedRegion, setFramedRegion] = useState<CoverageCity | null>('sf');
  const [fitKey, setFitKey] = useState(0);
  const years = [...new Set(outings.map(yearOf))].toSorted((a, b) => b - a);
  const sportOutings =
    sport === 'all' ? outings : outings.filter((outing) => outing.sport === sport);
  const visible =
    span.kind === 'all' ? sportOutings : sportOutings.filter((outing) => inSpan(span, outing));
  const filtered = sport !== 'all' || span.kind !== 'all';
  const bumpFit = () => setFitKey((key) => key + 1);
  const selectRegion = (nextCity: CoverageCity) => {
    setCityState(nextCity);
    setAtlasRegion(nextCity);
    setFramedRegion(nextCity);
    setAtlasCustomBounds(null);
    bumpFit();
  };
  const followAtlasCenter = (center: [number, number]) => {
    const region = regionForPoint(center);
    if (region === atlasRegion) {
      return;
    }
    setAtlasRegion(region);
    if (region) {
      setCityState(region);
    }
  };
  const applyFocus = (focus: AtlasFocus | null) => {
    switch (focus?.kind) {
      case undefined:
        return;
      case 'region':
        selectRegion(focus.city);
        return;
      case 'place':
        setAtlasRegion(null);
        setFramedRegion(null);
        setAtlasCustomBounds(focus.bounds);
        bumpFit();
        return;
      default: {
        const unhandled: never = focus;
        return unhandled;
      }
    }
  };
  const polylinesOf = (nextSport: SportFilter, nextSpan: Span) => {
    const matched =
      nextSport === 'all' ? outings : outings.filter((outing) => outing.sport === nextSport);
    const nextVisible =
      nextSpan.kind === 'all' ? matched : matched.filter((outing) => inSpan(nextSpan, outing));
    return nextVisible.flatMap((outing) => (outing.polyline ? [outing.polyline] : []));
  };
  const pickSport = (key: SportFilter) =>
    startTransition(() => {
      setSport(key);
      applyFocus(atlasFocusFor(key === 'all' && span.kind === 'all', polylinesOf(key, span)));
    });
  const pickSpan = (next: Span) =>
    startTransition(() => {
      setSpan(next);
      applyFocus(atlasFocusFor(sport === 'all' && next.kind === 'all', polylinesOf(sport, next)));
    });
  const pickSpanKey = (key: SpanKey) =>
    pickSpan(key === 'all' ? { kind: 'all' } : { key, kind: 'window', since: Date.now() });
  const spanKey = span.kind === 'window' ? span.key : span.kind === 'all' ? 'all' : null;
  const pickYear = (year: number) => pickSpan({ kind: 'year', year });
  const selectedYear = span.kind === 'year' ? span.year : null;
  return (
    <FilteredOutings
      value={{
        all: outings,
        atlasCustomBounds,
        atlasRegion,
        city,
        fitKey,
        followAtlasCenter,
        framedRegion,
        outings: visible,
        selectRegion,
        setCity: selectRegion,
        span: span.kind === 'all' ? 'all' : span.kind === 'year' ? span.year : span.key,
        spanLabel: spanLabel(span),
        sport,
        sportOutings,
      }}
    >
      <FilterBar className="strava__filters" variant="stack">
        {sports.length > 1 ? (
          <PaperPills
            label="Sport"
            onSelect={pickSport}
            options={sportKeys.map((key, index) => ({
              className: foldedSports.includes(key) ? 'pillPhoneHidden' : undefined,
              key,
              label: sportLabel(key),
              tiltDeg: SPORT_TILTS[index % SPORT_TILTS.length] ?? 0,
            }))}
            selected={sport}
          >
            {foldedSports.length > 0 ? (
              <PillMenu
                className="pillPhoneOnly"
                current={foldedSports.includes(sport)}
                face={foldedSports.includes(sport) ? sportLabel(sport) : 'More'}
                tiltDeg={0.9}
              >
                <PillMenuList label="More sports">
                  {foldedSports.map((key) => (
                    <li key={key}>
                      <PillMenuOption current={sport === key} onPick={() => pickSport(key)}>
                        {sportLabel(key)}
                      </PillMenuOption>
                    </li>
                  ))}
                </PillMenuList>
              </PillMenu>
            ) : null}
          </PaperPills>
        ) : null}
        <PaperPills
          label="Time span"
          onSelect={pickSpanKey}
          options={SPAN_OPTIONS}
          selected={spanKey}
        >
          {years.length > 1 ? (
            <YearMenu
              className="pillPhoneHidden"
              onPick={pickYear}
              selected={selectedYear}
              tiltDeg={-0.9}
              years={years}
            />
          ) : null}
          <PillMenu
            className="pillPhoneOnly"
            current={true}
            face={spanLabel(span, WINDOW_SHORT_LABELS)}
            panelClassName="yearMenu__panel"
            tiltDeg={-0.9}
          >
            <PillMenuList label="Time span">
              {SPAN_OPTIONS.map((option) => (
                <li key={option.key}>
                  <PillMenuOption
                    current={spanKey === option.key}
                    onPick={() => pickSpanKey(option.key)}
                  >
                    {option.label}
                  </PillMenuOption>
                </li>
              ))}
            </PillMenuList>
            {years.length > 1 ? (
              <YearGrid onPick={pickYear} selected={selectedYear} years={years} />
            ) : null}
          </PillMenu>
        </PaperPills>
      </FilterBar>
      <VisibleRoutes value={filtered ? new Set(visible.map(({ id }) => id)) : null}>
        {children}
      </VisibleRoutes>
    </FilteredOutings>
  );
}

export function RouteCountTag({ className }: { className?: string }) {
  const { outings } = useFilteredOutings();
  return (
    <PaperTag className={className} tiltDeg={6} tone="black">
      {formatRouteCount(outings.filter((outing) => outing.polyline).length)}
    </PaperTag>
  );
}
