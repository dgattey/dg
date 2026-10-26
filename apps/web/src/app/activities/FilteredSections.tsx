'use client';

import type { StravaBike, StravaLogEntry } from '@dg/content-models/strava/StravaHistory';
import type { AtlasRegion } from '@dg/maps/atlasGeometry';
import { RouteAtlasMap } from '@dg/maps/src/RouteAtlasMap';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import type { TileSource } from '@dg/maps/src/tileSource';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { useRef } from 'react';
import { PaperStrip } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { BikeOdometers } from './BikeOdometers';
import { ClimbingFlower } from './ClimbingFlower';
import { BiggestClimbs, LongestOutings, RecentOutings } from './OutingLog';
import { RoutePolaroid } from './RoutePolaroid';
import { useFilteredOutings } from './StravaFilters';
import { distanceComparison, everestComparison, movingTimeComparison } from './stravaComparisons';
import { formatCompactFeet, formatHours, formatMiles } from './stravaFormat';
import { SPORT_DETAILS, toMapRoutes } from './stravaSports';
import {
  biggestClimbs,
  longestOutings,
  monthlyClimbing,
  totalsOf,
  yearlyTotals,
} from './stravaStats';
import { YearlyMiles } from './YearlyMiles';

const LISTED_OUTINGS = 6;
const LONGEST_ROWS = 8;

/**
 * Miles, feet, and time for whatever the filters pick, cut as a ticket, a seal,
 * and a stamp at the top of the field notes. Each leads with something you can
 * picture, with the raw figure underneath.
 */
export function HeadlineTotals() {
  const { outings, sport, spanLabel } = useFilteredOutings();
  const totalsRef = useRef<{
    outings: typeof outings;
    totals: ReturnType<typeof totalsOf>;
  } | null>(null);
  if (!totalsRef.current || totalsRef.current.outings !== outings) {
    totalsRef.current = { outings, totals: totalsOf(outings) };
  }
  const totals = totalsRef.current.totals;
  const scope = `${sport === 'all' ? 'All sports' : SPORT_DETAILS[sport].filter} · ${spanLabel}`;
  const distance =
    totals.distanceMeters > 0
      ? distanceComparison(totals.distanceMeters)
      : { figure: '0', unit: 'miles' };
  const climb = everestComparison(totals.elevationGainMeters);
  const time = movingTimeComparison(totals.movingTimeSeconds, sport);
  return (
    <ul aria-label={`Totals, ${scope}`} className="strava__totals">
      <li className="strava__totalMiles">
        <Stub kind="ticket" size="compact" tiltDeg={-1.5} tone="ochre">
          <span className="strava__totalScope" data-typography="caption">
            {scope}
          </span>
          <span className="strava__totalFigure">
            <span data-typography="stat-xl">{distance.figure}</span>
            <span data-typography="label">{distance.unit}</span>
          </span>
          {totals.distanceMeters > 0 ? (
            <span className="strava__totalAside" data-typography="caption">
              {formatMiles(totals.distanceMeters)} mi
            </span>
          ) : null}
        </Stub>
      </li>
      <li className="strava__totalClimb">
        <Scallop tiltDeg={-4} tone="cobalt">
          <span data-typography="stat-md">{climb.figure}</span>
          <span data-typography="caption">{climb.unit}</span>
          <span className="strava__totalAside" data-typography="caption">
            {formatCompactFeet(totals.elevationGainMeters)} ft climbed
          </span>
        </Scallop>
      </li>
      <li className="strava__totalOutings">
        <Stub kind="stamp" size="compact" tiltDeg={1.2} tone="vermilion">
          <span data-typography="stat-lg">{time.figure}</span>
          <span data-typography="label">{time.unit}</span>
          <span className="strava__totalAside" data-typography="caption">
            {formatHours(totals.movingTimeSeconds)} · {formatCount(totals.outings)}{' '}
            {totals.outings === 1 ? 'activity' : 'activities'}
          </span>
        </Stub>
      </li>
    </ul>
  );
}

/** The longest route's distance as a trip you can picture, stuck to its print. */
function LongestSeal({ meters }: { meters: number }) {
  const { figure, unit } = distanceComparison(meters);
  return (
    <Scallop className="strava__longestSeal" size="sticker" tiltDeg={9} tone="ochre">
      <span data-typography="title-md">{figure}</span>
      <span className="strava__sealKey" data-typography="caption">
        {unit}
      </span>
    </Scallop>
  );
}

export function StravaAtlas({
  bounds,
  regions,
  tileSource,
}: {
  bounds: GeoBounds;
  regions: ReadonlyArray<AtlasRegion>;
  tileSource: TileSource;
}) {
  const {
    all,
    atlasCustomBounds,
    atlasRegion,
    fitKey,
    followAtlasCenter,
    framedRegion,
    selectRegion,
  } = useFilteredOutings();
  const routesCacheRef = useRef<{
    all: typeof all;
    routes: ReturnType<typeof toMapRoutes>;
  } | null>(null);
  if (!routesCacheRef.current || routesCacheRef.current.all !== all) {
    routesCacheRef.current = { all, routes: toMapRoutes(all) };
  }
  const framed = framedRegion ? (regions.find(({ key }) => key === framedRegion) ?? null) : null;
  const view = atlasCustomBounds ?? framed?.bounds ?? null;
  return (
    <>
      <RouteAtlasMap
        bounds={bounds}
        fitKey={fitKey}
        label="Map of every route I've tracked on Strava"
        onCenterChange={followAtlasCenter}
        routes={routesCacheRef.current.routes}
        tileSource={tileSource}
        view={view}
      />
      {regions.length > 1 ? (
        <PaperStrip
          className="strava__regions"
          label="Zoom to region"
          onSelect={selectRegion}
          options={regions}
          selected={atlasRegion}
        />
      ) : null}
    </>
  );
}

/**
 * The scrapbook bands under the atlas, all following the filters: climbing by
 * month beside the latest outings, distance records, then yearly miles beside
 * the biggest climbs and the bikes' odometers.
 */
export function StravaBands({
  bikes,
  tileSource,
}: {
  bikes: ReadonlyArray<StravaBike>;
  tileSource: TileSource;
}) {
  const { outings, span, sport, spanLabel, sportOutings } = useFilteredOutings();
  const distanceSport = sport === 'all' ? 'ride' : sport;
  const statsRef = useRef<{
    climbs: ReturnType<typeof biggestClimbs>;
    distanceSport: typeof distanceSport;
    longest: StravaLogEntry | undefined;
    longestForSport: ReturnType<typeof longestOutings>;
    months: ReturnType<typeof monthlyClimbing>;
    outings: typeof outings;
    recent: ReadonlyArray<StravaLogEntry>;
    sportOutings: typeof sportOutings;
    years: ReturnType<typeof yearlyTotals>;
  } | null>(null);
  if (
    !statsRef.current ||
    statsRef.current.outings !== outings ||
    statsRef.current.sportOutings !== sportOutings ||
    statsRef.current.distanceSport !== distanceSport
  ) {
    const [longest] = longestOutings(
      outings.filter((outing) => outing.polyline),
      1,
    );
    statsRef.current = {
      climbs: biggestClimbs(outings, LISTED_OUTINGS),
      distanceSport,
      longest,
      longestForSport: longestOutings(
        outings.filter((outing) => outing.sport === distanceSport),
        LONGEST_ROWS,
      ),
      months: monthlyClimbing(outings),
      outings,
      recent: outings.slice(0, LISTED_OUTINGS),
      sportOutings,
      years: yearlyTotals(sportOutings),
    };
  }
  const { climbs, longest, longestForSport, months, recent, years } = statsRef.current;
  return (
    <>
      <div className="strava__band">
        <ClimbingFlower
          months={months}
          span={spanLabel}
          year={typeof span === 'number' ? span : null}
        />
        <RecentOutings outings={recent} />
      </div>
      <div className="strava__band">
        <LongestOutings
          heading={`Longest ${SPORT_DETAILS[distanceSport].filter.toLowerCase()}`}
          outings={longestForSport}
        />
        {longest ? (
          <RoutePolaroid
            className="strava__longest"
            outing={longest}
            tileSource={tileSource}
            tiltDeg={3.2}
          >
            <PaperTag className="collagePin strava__longestTag" tiltDeg={-7} tone="rose">
              Longest activity
            </PaperTag>
            <LongestSeal meters={longest.distanceMeters} />
          </RoutePolaroid>
        ) : null}
      </div>
      <div className="strava__band">
        <YearlyMiles years={years} />
        <BiggestClimbs outings={climbs} />
        <BikeOdometers bikes={bikes} />
      </div>
    </>
  );
}
