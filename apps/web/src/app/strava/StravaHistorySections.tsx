import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { atlasBounds, simplifyPolyline } from '@dg/maps/atlasGeometry';
import { getTileSource } from '@dg/maps/src/getTileSource';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { FieldNotes } from './FieldNotes';
import { StravaAtlas, StravaBands } from './FilteredSections';
import { SfStreetCoverageSection } from './SfStreetCoverageSection';
import { RouteCountTag, StravaFilters } from './StravaFilters';
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
 * Everything after the title on `/strava`, as items of the page's grid so the
 * filters can sit beside the title: the filterable atlas beside the field
 * notes, then the scrapbook bands. Routes are simplified once here and shared
 * by the atlas, the logbook loops, and the longest outing's print.
 */
export function StravaHistorySections({ history }: { history: StravaHistory }) {
  const tileSource = getTileSource();
  const outings = history.outings.map((outing) => ({
    ...outing,
    polyline: outing.polyline ? simplifyPolyline(outing.polyline) || null : null,
  }));
  return (
    <StravaFilters outings={outings}>
      <div className="strava__atlas">
        <FieldNotes history={history} tileSource={tileSource} />
        <AtlasSheet>
          <div className="strava__atlasMap">
            <StravaAtlas bounds={atlasBounds(toMapRoutes(outings))} tileSource={tileSource} />
          </div>
          <RouteCountTag className="collagePin strava__routeCount" />
        </AtlasSheet>
      </div>
      <SfStreetCoverageSection coverage={history.sfCoverage} />
      <StravaBands bikes={history.bikes} tileSource={tileSource} />
    </StravaFilters>
  );
}
