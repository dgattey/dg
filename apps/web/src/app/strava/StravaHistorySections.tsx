import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { RouteAtlas } from '@dg/maps/RouteAtlas';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { ClimbingFlower } from './ClimbingFlower';
import { FieldNotes } from './FieldNotes';
import { BiggestClimbs, RecentOutings } from './OutingLog';
import { RouteCountTag, RouteFilter } from './RouteFilter';
import { RoutePolaroid } from './RoutePolaroid';
import { toMapRoutes } from './stravaSports';
import { YearlyMiles } from './YearlyMiles';

/** The cerulean backing and cream print the atlas sits on, shared with the skeleton. */
export function AtlasSheet({ children }: { children: ReactNode }) {
  return (
    <div className="strava__atlasPrint">
      <PaperCard className="strava__atlasBacking" edge="torn-c" tiltDeg={2.4} tone="cerulean" />
      <PaperCard
        className="strava__atlasSheet"
        edge="quad-c"
        innerClassName="strava__atlasMat"
        tiltDeg={-1}
      >
        {children}
      </PaperCard>
    </div>
  );
}

/**
 * Everything below the title on `/strava`: the filterable atlas beside the
 * field notes, then the climbing flower, logbooks, and yearly tickets.
 */
export function StravaHistorySections({ history }: { history: StravaHistory }) {
  const climbs = history.biggestClimbs.filter((outing) => outing.elevationGainMeters > 0);
  return (
    <div className="strava__sections">
      <div className="strava__explore">
        <RouteFilter
          routes={history.routes.map(({ id, sport, year }) => ({ id, sport, year }))}
          thisYear={history.thisYear.year}
        >
          <div className="strava__atlas">
            <FieldNotes history={history} />
            <AtlasSheet>
              <div className="strava__atlasMap">
                <RouteAtlas
                  label="Map of every route I've tracked on Strava"
                  routes={toMapRoutes(history.routes)}
                />
              </div>
              <RouteCountTag className="collagePin strava__routeCount" />
            </AtlasSheet>
          </div>
        </RouteFilter>
      </div>
      <div className="strava__band">
        <ClimbingFlower months={history.monthlyClimbingMeters} year={history.thisYear.year} />
        <RecentOutings outings={history.recent} />
      </div>
      <div className="strava__band">
        <YearlyMiles years={history.years} />
        {climbs.length > 0 ? <BiggestClimbs outings={climbs} /> : null}
        {history.longest.polyline ? (
          <RoutePolaroid className="strava__longest" outing={history.longest} tiltDeg={3.2}>
            <PaperTag className="collagePin strava__longestTag" tiltDeg={-7} tone="rose">
              Longest outing
            </PaperTag>
          </RoutePolaroid>
        ) : null}
      </div>
    </div>
  );
}
