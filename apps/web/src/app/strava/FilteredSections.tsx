'use client';

import type { StravaBike } from '@dg/content-models/strava/StravaHistory';
import { RouteAtlasMap } from '@dg/maps/src/RouteAtlasMap';
import type { GeoBounds } from '@dg/maps/src/routeFrame';
import type { TileSource } from '@dg/maps/src/tileSource';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { BikeOdometers } from './BikeOdometers';
import { ClimbingFlower } from './ClimbingFlower';
import { BiggestClimbs, LongestOutings, RecentOutings } from './OutingLog';
import { RoutePolaroid } from './RoutePolaroid';
import { useFilteredOutings } from './StravaFilters';
import { formatCompactFeet, formatCount, formatMiles } from './stravaFormat';
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

/** Miles, feet, and outings for whatever the filters pick, at the top of the field notes. */
export function HeadlineTotals() {
  const { outings, sport, spanLabel } = useFilteredOutings();
  const totals = totalsOf(outings);
  return (
    <PaperCard
      className="strava__tally"
      edge="soft-b"
      innerClassName="strava__tallyInner"
      tiltDeg={-1.2}
    >
      <span className="strava__tallyHead">
        <span>{sport === 'all' ? 'Every sport' : SPORT_DETAILS[sport].filter}</span>
        <span>{spanLabel}</span>
      </span>
      <dl className="strava__tallyFigures">
        <div className="strava__tallyFigure">
          <dt>Miles</dt>
          <dd>{formatMiles(totals.distanceMeters)}</dd>
        </div>
        <div className="strava__tallyFigure">
          <dt>Feet climbed</dt>
          <dd>{formatCompactFeet(totals.elevationGainMeters)}</dd>
        </div>
        <div className="strava__tallyFigure">
          <dt>{totals.outings === 1 ? 'Outing' : 'Outings'}</dt>
          <dd>{formatCount(totals.outings)}</dd>
        </div>
      </dl>
    </PaperCard>
  );
}

/** Every route on the atlas; the filters hide the rest in place instead of redrawing. */
export function StravaAtlas({ bounds, tileSource }: { bounds: GeoBounds; tileSource: TileSource }) {
  const { all } = useFilteredOutings();
  return (
    <RouteAtlasMap
      bounds={bounds}
      label="Map of every route I've tracked on Strava"
      routes={toMapRoutes(all)}
      tileSource={tileSource}
    />
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
  const { outings, sport, spanLabel, sportOutings } = useFilteredOutings();
  const distanceSport = sport === 'all' ? 'ride' : sport;
  const [longest] = longestOutings(
    outings.filter((outing) => outing.polyline),
    1,
  );
  return (
    <>
      <div className="strava__band">
        <ClimbingFlower months={monthlyClimbing(outings)} span={spanLabel} />
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
              Longest outing
            </PaperTag>
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
