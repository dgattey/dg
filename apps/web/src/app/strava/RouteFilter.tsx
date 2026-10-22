'use client';

import type { StravaRouteTrace } from '@dg/content-models/strava/StravaHistory';
import { VisibleRoutes } from '@dg/maps/VisibleRoutes';
import { createContext, type ReactNode, startTransition, use, useState } from 'react';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
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

/** What the filter needs from a route; polylines go straight to the map instead. */
export type FilterableRoute = Pick<StravaRouteTrace, 'id' | 'sport' | 'year'>;

const VisibleRouteCount = createContext(0);

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

/** Sport and time filters that pick which routes the `RouteAtlas` below inks. */
export function RouteFilter({
  children,
  routes,
  thisYear,
}: {
  children: ReactNode;
  routes: ReadonlyArray<FilterableRoute>;
  thisYear: number;
}) {
  const [sport, setSport] = useState<SportFilter>('all');
  const [span, setSpan] = useState<SpanFilter>('all');
  const sports = FILTER_SPORTS.filter((key) => routes.some((route) => route.sport === key));
  const spans = new Set(routes.map((route) => (route.year === thisYear ? 'year' : 'all')));
  const visible = routes.filter(
    (route) =>
      (sport === 'all' || route.sport === sport) && (span === 'all' || route.year === thisYear),
  );
  const filtered = sport !== 'all' || span !== 'all';
  return (
    <VisibleRouteCount value={visible.length}>
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
      <VisibleRoutes value={filtered ? new Set(visible.map(({ id }) => id)) : null}>
        {children}
      </VisibleRoutes>
    </VisibleRouteCount>
  );
}

export function RouteCountTag({ className }: { className?: string }) {
  return (
    <PaperTag className={className} tiltDeg={6} tone="black">
      {formatRouteCount(use(VisibleRouteCount))}
    </PaperTag>
  );
}
