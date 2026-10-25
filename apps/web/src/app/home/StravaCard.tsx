import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { RoutePeek } from '@dg/maps/RoutePeek';
import { getTileSource } from '@dg/maps/src/getTileSource';
import { activitiesRoute } from '@dg/shared-core/routes/app';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { RoutePolaroid } from '../activities/RoutePolaroid';
import { formatMiles, formatRouteCount } from '../activities/stravaFormat';
import { toMapRoutes } from '../activities/stravaSports';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';

/**
 * The homepage's Strava gatefold: every route around home up top, linking to
 * `/activities` with the lifetime total sealed on its corner, the latest outing's
 * print stepped down beside this year's miles.
 */
export function StravaCard({ history }: { history: StravaHistory | null }) {
  if (!history) {
    return null;
  }
  const { latest, outings, thisYear, totals } = history;
  const routes = toMapRoutes(outings);
  return (
    <div className="home__strava" data-slot="st">
      <div className="home__stravaAtlas collageLift">
        <h2 className="home__stravaHeading">
          <PaperTag className="collageEyebrow" tiltDeg={-4} tone="viridian">
            Exercise stats
          </PaperTag>
        </h2>
        <PageTransitionLink
          className="home__stravaAtlasLink"
          href={activitiesRoute}
          title="Big map"
        >
          <PaperCard edge="quad-c" innerClassName="home__stravaAtlasMat" tiltDeg={3}>
            <span aria-hidden="true" className="home__stravaMap">
              <RoutePeek routes={routes} />
            </span>
          </PaperCard>
          <PaperTag className="collagePin home__activitiesRoutes" tiltDeg={5} tone="ochre">
            {formatRouteCount(routes.length)}
          </PaperTag>
        </PageTransitionLink>
        <Scallop className="home__stravaTotal" size="sticker" tiltDeg={-9} tone="rose">
          <span className="strava__sealKey" data-typography="meta">
            Total
          </span>
          <span data-typography="label">{formatMiles(totals.distanceMeters)} mi</span>
        </Scallop>
      </div>
      <RoutePolaroid
        className="home__stravaLatest"
        outing={latest}
        tileSource={getTileSource()}
        tiltDeg={-2.2}
      >
        <Scallop className="home__stravaWhen" size="sticker" tiltDeg={10} tone="vermilion">
          <span className="strava__sealKey" data-typography="meta">
            Latest
          </span>
          <span data-typography="label">
            <RelativeTime date={latest.startDate} hasTooltip={false} isCapitalized />
          </span>
        </Scallop>
      </RoutePolaroid>
      <Stub className="home__stravaTicket" kind="ticket" size="sm" tiltDeg={-4} tone="ochre">
        <span className="strava__sealKey" data-typography="meta">
          This year
        </span>
        <span data-typography="title-md">{formatMiles(thisYear.distanceMeters)} mi</span>
      </Stub>
    </div>
  );
}
