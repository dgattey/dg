'use client';

import type { RouteGroup } from '@dg/maps/bay/bayRoutes';
import {
  createContext,
  type ReactNode,
  startTransition,
  use,
  useState,
  ViewTransition,
} from 'react';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { RouteInk } from './RouteInk';
import { formatRouteCount } from './stravaFormat';
import { SPORT_DETAILS } from './stravaSports';

const FILTER_SPORTS = ['ride', 'run', 'hike'] as const;

type SportFilter = 'all' | (typeof FILTER_SPORTS)[number];

type SpanFilter = 'all' | 'year';

const SPAN_OPTIONS = [
  { key: 'all', label: 'All time', tiltDeg: 0.8 },
  { key: 'year', label: 'This year', tiltDeg: -1.2 },
] as const satisfies ReadonlyArray<{ key: SpanFilter; label: string; tiltDeg: number }>;

const SPORT_TILTS = [-1, 1.2, -0.6, 0.9] as const;

const RouteFilterContext = createContext<ReadonlyArray<RouteGroup>>([]);

const sportOption = (key: SportFilter, index: number): PaperPillOption<SportFilter> => ({
  key,
  label:
    key === 'all' ? (
      'All routes'
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

/**
 * Sport and time filters over the projected route groups. The groups come
 * pre-projected from the server; this only picks which ones to ink.
 */
export function RouteFilter({
  children,
  groups,
  thisYear,
}: {
  children: ReactNode;
  groups: ReadonlyArray<RouteGroup>;
  thisYear: number;
}) {
  const [sport, setSport] = useState<SportFilter>('all');
  const [span, setSpan] = useState<SpanFilter>('all');
  const sports = FILTER_SPORTS.filter((key) => groups.some((group) => group.sport === key));
  const spans = new Set(groups.map((group) => (group.year === thisYear ? 'year' : 'all')));
  const visible = groups.filter(
    (group) =>
      (sport === 'all' || group.sport === sport) && (span === 'all' || group.year === thisYear),
  );
  return (
    <RouteFilterContext value={visible}>
      {sports.length > 1 || spans.size > 1 ? (
        <div className="strava__filters">
          {sports.length > 1 ? (
            <PaperPills
              label="Sport"
              onSelect={(key) => startTransition(() => setSport(key))}
              options={(['all', ...sports] as const).map(sportOption)}
              selected={sport}
            />
          ) : null}
          {spans.size > 1 ? (
            <PaperPills
              label="Time span"
              onSelect={(key) => startTransition(() => setSpan(key))}
              options={SPAN_OPTIONS}
              selected={span}
            />
          ) : null}
        </div>
      ) : null}
      {children}
    </RouteFilterContext>
  );
}

/** Cross-fades the map print when the filter changes. */
export function FilteredMap({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" update="auto">
      <div className="strava__filteredMap">{children}</div>
    </ViewTransition>
  );
}

export function FilteredRouteInk() {
  return <RouteInk groups={use(RouteFilterContext)} />;
}

export function RouteCountTag({ className }: { className?: string }) {
  const routes = use(RouteFilterContext).reduce((sum, group) => sum + group.routes, 0);
  return (
    <PaperTag className={className} tiltDeg={6} tone="black">
      {formatRouteCount(routes)}
    </PaperTag>
  );
}
