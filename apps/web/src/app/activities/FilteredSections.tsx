'use client';

import type { StravaBike } from '@dg/content-models/strava/StravaHistory';
import type { AtlasRegion } from '@dg/maps/atlasGeometry';
import { RouteAtlasMap } from '@dg/maps/src/RouteAtlasMap';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import type { TileSource } from '@dg/maps/src/tileSource';
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
import { formatCompactFeet, formatCount, formatHours, formatMiles } from './stravaFormat';
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
  const totals = totalsOf(outings);
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
        <Stub kind="ticket" tiltDeg={-1.5} tone="ochre">
          <span className="strava__totalScope">{scope}</span>
          <span className="strava__totalFigure">
            <span className="strava__totalNumber">{distance.figure}</span>
            <span className="strava__totalUnit">{distance.unit}</span>
          </span>
          {totals.distanceMeters > 0 ? (
            <span className="strava__totalAside">{formatMiles(totals.distanceMeters)} mi</span>
          ) : null}
        </Stub>
      </li>
      <li className="strava__totalClimb">
        <Scallop tiltDeg={-4} tone="cobalt">
          <span className="strava__totalNumber">{climb.figure}</span>
          <span className="strava__totalUnit">{climb.unit}</span>
          <span className="strava__totalAside">
            {formatCompactFeet(totals.elevationGainMeters)} ft climbed
          </span>
        </Scallop>
      </li>
      <li className="strava__totalOutings">
        <Stub kind="stamp" tiltDeg={1.2} tone="vermilion">
          <span className="strava__totalNumber">{time.figure}</span>
          <span className="strava__totalUnit">{time.unit}</span>
          <span className="strava__totalAside">
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
      <span className="strava__sealValue">{figure}</span>
      <span className="strava__sealKey">{unit}</span>
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
  const { all, city, setCity } = useFilteredOutings();
  const routesCacheRef = useRef<{
    all: typeof all;
    routes: ReturnType<typeof toMapRoutes>;
  } | null>(null);
  if (!routesCacheRef.current || routesCacheRef.current.all !== all) {
    routesCacheRef.current = { all, routes: toMapRoutes(all) };
  }
  const region = regions.find(({ key }) => key === city) ?? regions[0] ?? null;
  return (
    <>
      <RouteAtlasMap
        bounds={bounds}
        label="Map of every route I've tracked on Strava"
        routes={routesCacheRef.current.routes}
        tileSource={tileSource}
        view={region?.bounds ?? null}
      />
      {regions.length > 1 ? (
        <PaperStrip
          className="strava__regions"
          label="Zoom to region"
          onSelect={setCity}
          options={regions}
          selected={region?.key ?? city}
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
  const [longest] = longestOutings(
    outings.filter((outing) => outing.polyline),
    1,
  );
  return (
    <>
      <div className="strava__band">
        <ClimbingFlower
          months={monthlyClimbing(outings)}
          span={spanLabel}
          year={typeof span === 'number' ? span : null}
        />
        <RecentOutings outings={outings.slice(0, LISTED_OUTINGS)} />
      </div>
      <div className="strava__band">
        <LongestOutings
          heading={`Longest ${SPORT_DETAILS[distanceSport].filter.toLowerCase()}`}
          outings={longestOutings(
            outings.filter((outing) => outing.sport === distanceSport),
            LONGEST_ROWS,
          )}
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
        <YearlyMiles years={yearlyTotals(sportOutings)} />
        <BiggestClimbs outings={biggestClimbs(outings, LISTED_OUTINGS)} />
        <BikeOdometers bikes={bikes} />
      </div>
    </>
  );
}
