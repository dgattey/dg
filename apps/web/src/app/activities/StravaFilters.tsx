'use client';

import type { StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import {
  type CoverageSpan,
  STRAVA_WINDOW_DAYS,
  type StravaWindow,
} from '@dg/content-models/strava/StreetCoverage';
import { VisibleRoutes } from '@dg/maps/VisibleRoutes';
import { createContext, type ReactNode, startTransition, use, useState } from 'react';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { YearMenu } from '../collage/YearMenu';
import { formatRouteCount } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';
import { yearOf } from './stravaStats';

const FILTER_SPORTS = ['ride', 'run', 'hike', 'ski'] as const;

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

const SPAN_OPTIONS = [
  { key: 'all', label: 'All time', tiltDeg: 0.8 },
  { key: 'week', label: WINDOW_LABELS.week, tiltDeg: -1.2 },
  { key: 'month', label: WINDOW_LABELS.month, tiltDeg: 0.6 },
] as const satisfies ReadonlyArray<PaperPillOption<SpanKey>>;

const SPORT_TILTS = [-1, 1.2, -0.6, 0.9] as const;

type Filtered = {
  /** Every outing, newest first, whatever is picked. */
  all: ReadonlyArray<StravaLogEntry>;
  /** Outings in the picked sport and span, newest first. */
  outings: ReadonlyArray<StravaLogEntry>;
  /** Outings in the picked sport across every year, for views that are already per year. */
  sportOutings: ReadonlyArray<StravaLogEntry>;
  sport: SportFilter;
  /** The span in words, `All time`, `This week`, or a year. */
  spanLabel: string;
  span: CoverageSpan;
};

const FilteredOutings = createContext<Filtered>({
  all: [],
  outings: [],
  span: 'all',
  spanLabel: SPAN_OPTIONS[0].label,
  sport: 'ride',
  sportOutings: [],
});

export const useFilteredOutings = () => use(FilteredOutings);

const sportOption = (key: SportFilter, index: number): PaperPillOption<SportFilter> => ({
  key,
  label:
    key === 'all' ? (
      'All sports'
    ) : (
      <>
        <span
          aria-hidden="true"
          className="strava__filterDot"
          style={{ backgroundColor: `var(--${SPORT_DETAILS[key].tone})` }}
        />
        {SPORT_DETAILS[key].filter}
      </>
    ),
  tiltDeg: SPORT_TILTS[index % SPORT_TILTS.length] ?? 0,
});

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

function spanLabel(span: Span) {
  switch (span.kind) {
    case 'all':
      return SPAN_OPTIONS[0].label;
    case 'window':
      return WINDOW_LABELS[span.key];
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
  const [sport, setSport] = useState<SportFilter>(() => (sports.includes('ride') ? 'ride' : 'all'));
  const [span, setSpan] = useState<Span>({ kind: 'all' });
  const years = [...new Set(outings.map(yearOf))].toSorted((a, b) => b - a);
  const sportOutings =
    sport === 'all' ? outings : outings.filter((outing) => outing.sport === sport);
  const visible =
    span.kind === 'all' ? sportOutings : sportOutings.filter((outing) => inSpan(span, outing));
  const filtered = sport !== 'all' || span.kind !== 'all';
  const pickSpan = (next: Span) => startTransition(() => setSpan(next));
  return (
    <FilteredOutings
      value={{
        all: outings,
        outings: visible,
        span: span.kind === 'all' ? 'all' : span.kind === 'year' ? span.year : span.key,
        spanLabel: spanLabel(span),
        sport,
        sportOutings,
      }}
    >
      <div className="strava__filters">
        {sports.length > 1 ? (
          <PaperPills
            label="Sport"
            onSelect={(key) => startTransition(() => setSport(key))}
            options={([...sports, 'all'] as const).map(sportOption)}
            selected={sport}
          />
        ) : null}
        <div className="strava__spans">
          <PaperPills
            label="Time span"
            onSelect={(key) =>
              pickSpan(key === 'all' ? { kind: 'all' } : { key, kind: 'window', since: Date.now() })
            }
            options={SPAN_OPTIONS}
            selected={span.kind === 'window' ? span.key : span.kind === 'all' ? 'all' : null}
          />
          {years.length > 1 ? (
            <YearMenu
              onPick={(year) => pickSpan({ kind: 'year', year })}
              selected={span.kind === 'year' ? span.year : null}
              tiltDeg={-0.9}
              years={years}
            />
          ) : null}
        </div>
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
