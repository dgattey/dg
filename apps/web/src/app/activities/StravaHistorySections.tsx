import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { atlasBounds, atlasRegions } from '@dg/maps/atlasGeometry';
import { getTileSource } from '@dg/maps/src/getTileSource';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { FieldNotes } from './FieldNotes';
import { StravaAtlas, StravaBands } from './FilteredSections';
import { RouteCountTag, StravaFilters } from './StravaFilters';
import { StreetCoverageSection } from './StreetCoverageSection';
import { toMapRoutes } from './stravaSports';

/** The cerulean backing and cream print the atlas sits on, shared with the skeleton. */
export function AtlasSheet({ children }: { children: ReactNode }) {
  return (
    <div className="strava__atlasPrint">
      <PaperCard className="strava__atlasBacking" edge="torn-c" tiltDeg={2.4} tone="cerulean" />
      <PaperCard edge="quad-c" innerClassName="strava__atlasMat" tiltDeg={-1}>
        {children}
      </PaperCard>
    </div>
  );
}

/**
 * Everything after the title on `/activities`, as items of the page's grid so the
 * filters can sit beside the title: the filterable atlas beside the field
 * notes, then the scrapbook bands.
 */
export function StravaHistorySections({ history }: { history: StravaHistory }) {
  const tileSource = getTileSource();
  const routes = toMapRoutes(history.outings);
  return (
    <StravaFilters outings={history.outings}>
      <div className="strava__atlas">
        <FieldNotes history={history} tileSource={tileSource} />
        <AtlasSheet>
          <div className="strava__atlasMap">
            <StravaAtlas
              bounds={atlasBounds(routes)}
              regions={atlasRegions(routes)}
              tileSource={tileSource}
            />
          </div>
          <RouteCountTag className="collagePin strava__routeCount" />
        </AtlasSheet>
      </div>
      <StreetCoverageSection coverage={history.streetCoverage} />
      <StravaBands bikes={history.bikes} tileSource={tileSource} />
    </StravaFilters>
  );
}
