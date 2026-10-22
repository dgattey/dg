import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { RoutePeek } from '@dg/maps/RoutePeek';
import { getTileSource } from '@dg/maps/src/getTileSource';
import { stravaRoute } from '@dg/shared-core/routes/app';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { RoutePolaroid } from '../strava/RoutePolaroid';
import { formatMiles, formatRouteCount } from '../strava/stravaFormat';
import { toMapRoutes } from '../strava/stravaSports';

/**
 * The homepage's Strava gatefold: every route around home up top, linking to
 * `/strava` with the lifetime total sealed on its corner, the latest outing's
 * print stepped down beside this year's miles.
 */
export function StravaCard({ history }: { history: StravaHistory | null }) {
  if (!history) {
    return null;
  }
  const { latest, outings, thisYear, totals } = history;
  const routes = toMapRoutes(outings);
  return (
    <div className="home__strava" data-slot="st" style={{ gridArea: 'st' }}>
      <div className="home__stravaAtlas collageLift">
        <PageTransitionLink className="home__stravaAtlasLink" href={stravaRoute} title="Big map">
          <PaperCard edge="quad-c" innerClassName="home__stravaAtlasMat" tiltDeg={3}>
            <span aria-hidden="true" className="home__stravaMap">
              <RoutePeek routes={routes} />
            </span>
          </PaperCard>
          <PaperTag className="collagePin home__stravaRoutes" tiltDeg={5} tone="ochre">
            {formatRouteCount(routes.length)}
          </PaperTag>
        </PageTransitionLink>
        <Scallop className="home__stravaTotal" size="sticker" tiltDeg={-9} tone="rose">
          <span className="strava__sealKey">Total</span>
          <span className="strava__sealWhen">{formatMiles(totals.distanceMeters)} mi</span>
        </Scallop>
      </div>
      <RoutePolaroid
        className="home__stravaLatest"
        outing={latest}
        tileSource={getTileSource()}
        tiltDeg={-2.2}
      >
        <Scallop className="home__stravaWhen" size="sticker" tiltDeg={10} tone="vermilion">
          <span className="strava__sealKey">Latest</span>
          <span className="strava__sealWhen">
            <RelativeTime date={latest.startDate} hasTooltip={false} isCapitalized />
          </span>
        </Scallop>
      </RoutePolaroid>
      <Stub className="home__stravaTicket" kind="ticket" tiltDeg={-4} tone="ochre">
        <span className="strava__sealKey">This year</span>
        <span className="strava__sealValue">{formatMiles(thisYear.distanceMeters)} mi</span>
      </Stub>
    </div>
  );
}
