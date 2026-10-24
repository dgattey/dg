'use client';

import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import {
  type CoverageCity,
  type CoverageSpan,
  STRAVA_WINDOW_DAYS,
  type StravaWindow,
} from '@dg/content-models/strava/StreetCoverage';
import { VisibleRoutes } from '@dg/maps/VisibleRoutes';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  startTransition,
  use,
  useState,
} from 'react';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { PillMenu, PillMenuList, PillMenuOption } from '../collage/PillMenu';
import { YearGrid, YearMenu } from '../collage/YearMenu';
import { formatRouteCount } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';
import { yearOf } from './stravaStats';

const FILTER_SPORTS = ['ride', 'ski', 'hike', 'run'] as const;

/** Phones show this many sport pills and fold the rest into `More ▾`, keeping the bar one row. */
const PHONE_SPORT_PILLS = 2;

type SportFilter = 'all' | (typeof FILTER_SPORTS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** A rolling window keeps the moment it was picked, so rendering never reads the clock. */
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
  /** Every outing, newest first, whatever is picked. */
  all: ReadonlyArray<StravaLogEntry>;
  city: CoverageCity;
  /** Outings in the picked sport and span, newest first. */
  outings: ReadonlyArray<StravaLogEntry>;
  setCity: (city: CoverageCity) => void;
  /** Outings in the picked sport across every year, for views that are already per year. */
  sportOutings: ReadonlyArray<StravaLogEntry>;
  sport: SportFilter;
  /** The span in words, `All time`, `This week`, or a year. */
  spanLabel: string;
  span: CoverageSpan;
};

const FilteredOutings = createContext<Filtered>({
  all: [],
  city: 'sf',
  outings: [],
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

/**
 * Sport and time filters for everything on the page. The pills sit beside the
 * title; the outings they pick reach the sections through `useFilteredOutings`
 * and the atlas through `VisibleRoutes`, so the map filters in place.
 */
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
  const [city, setCity] = useState<CoverageCity>('sf');
  const years = [...new Set(outings.map(yearOf))].toSorted((a, b) => b - a);
  const sportOutings =
    sport === 'all' ? outings : outings.filter((outing) => outing.sport === sport);
  const visible =
    span.kind === 'all' ? sportOutings : sportOutings.filter((outing) => inSpan(span, outing));
  const filtered = sport !== 'all' || span.kind !== 'all';
  const pickSport = (key: SportFilter) => startTransition(() => setSport(key));
  const pickSpan = (next: Span) => startTransition(() => setSpan(next));
  const pickSpanKey = (key: SpanKey) =>
    pickSpan(key === 'all' ? { kind: 'all' } : { key, kind: 'window', since: Date.now() });
  const spanKey = span.kind === 'window' ? span.key : span.kind === 'all' ? 'all' : null;
  const pickYear = (year: number) => pickSpan({ kind: 'year', year });
  const selectedYear = span.kind === 'year' ? span.year : null;
  return (
    <FilteredOutings
      value={{
        all: outings,
        city,
        outings: visible,
        setCity,
        span: span.kind === 'all' ? 'all' : span.kind === 'year' ? span.year : span.key,
        spanLabel: spanLabel(span),
        sport,
        sportOutings,
      }}
    >
      <div className="strava__filters pillStrip">
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
      </div>
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
