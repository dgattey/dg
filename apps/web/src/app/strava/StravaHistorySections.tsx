import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { routeGroups } from '@dg/maps/bay/bayRoutes';
import type { MercatorFrame } from '@dg/maps/bay/mercatorFrame';
import type { ReactNode } from 'react';
import { BayMap } from '../collage/BayMap';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { ClimbingFlower } from './ClimbingFlower';
import { FieldNotes } from './FieldNotes';
import { BiggestClimbs, RecentOutings } from './OutingLog';
import { FilteredMap, FilteredRouteInk, RouteCountTag, RouteFilter } from './RouteFilter';
import { RoutePolaroid, routePrint } from './RoutePolaroid';
import { YearlyMiles } from './YearlyMiles';

/** Portrait frame from the Golden Gate Park edge up past Angel Island and across to Oakland. */
const ATLAS_FRAME: MercatorFrame = {
  center: [37.828, -122.4],
  height: 940,
  lonSpan: 0.4,
  width: 780,
};

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
  const longest = routePrint(history.longest);
  const climbs = history.biggestClimbs.filter((outing) => outing.elevationGainMeters > 0);
  return (
    <div className="strava__sections">
      <div className="strava__explore">
        <RouteFilter
          groups={routeGroups(ATLAS_FRAME, history.routes)}
          thisYear={history.thisYear.year}
        >
          <div className="strava__atlas">
            <FieldNotes history={history} />
            <AtlasSheet>
              <FilteredMap>
                <BayMap
                  frame={ATLAS_FRAME}
                  labels
                  routes={<FilteredRouteInk />}
                  title="Every route I've tracked, on a watercolor map of the Bay Area"
                />
              </FilteredMap>
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
        {longest ? (
          <RoutePolaroid
            className="strava__longest"
            outing={history.longest}
            print={longest}
            tiltDeg={3.2}
          >
            <PaperTag className="collagePin strava__longestTag" tiltDeg={-7} tone="rose">
              Longest outing
            </PaperTag>
          </RoutePolaroid>
        ) : null}
      </div>
    </div>
  );
}
