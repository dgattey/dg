import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { routeGroups } from '@dg/maps/bay/bayRoutes';
import type { MercatorFrame } from '@dg/maps/bay/mercatorFrame';
import { stravaRoute } from '@dg/shared-core/routes/app';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { BayMap } from '../collage/BayMap';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { RouteInk } from '../strava/RouteInk';
import { RoutePolaroid, routePrint } from '../strava/RoutePolaroid';
import { formatCompactFeet, formatMiles, formatRouteCount } from '../strava/stravaFormat';

/** San Francisco and the East Bay shore, landscape, for the fanned-out map print. */
const HOME_FRAME: MercatorFrame = {
  center: [37.8, -122.42],
  height: 290,
  lonSpan: 0.5,
  width: 380,
};

/**
 * The homepage's Strava gatefold: the latest outing's print in front, the Bay
 * of every route fanned out behind it toward `/strava` with the lifetime total
 * sealed on its corner, and this year's numbers stuck on below.
 */
export function StravaCard({ history }: { history: StravaHistory | null }) {
  if (!history) {
    return null;
  }
  const { latest, thisYear, totals } = history;
  const groups = routeGroups(HOME_FRAME, history.routes);
  const routes = groups.reduce((sum, group) => sum + group.routes, 0);
  return (
    <div className="home__strava" data-slot="st" style={{ gridArea: 'st' }}>
      <div className="home__stravaAtlas collageLift">
        <PageTransitionLink
          className="home__stravaAtlasLink"
          href={stravaRoute}
          title="Bay Area miles"
        >
          <PaperCard edge="quad-c" innerClassName="home__stravaAtlasMat" tiltDeg={3}>
            <BayMap
              className="home__stravaMap"
              frame={HOME_FRAME}
              routes={<RouteInk groups={groups} />}
              title="Every route I've tracked around the Bay"
            />
          </PaperCard>
          <PaperTag className="collagePin home__stravaRoutes" tiltDeg={5} tone="ochre">
            {formatRouteCount(routes)}
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
        print={routePrint(latest)}
        tiltDeg={-2.6}
      >
        <Scallop className="home__stravaWhen" size="sticker" tiltDeg={-14} tone="vermilion">
          <span className="strava__sealKey">Latest</span>
          <span className="strava__sealWhen">
            <RelativeTime date={latest.startDate} hasTooltip={false} />
          </span>
        </Scallop>
      </RoutePolaroid>
      <ul aria-label="Strava totals" className="home__stravaStickers">
        <li>
          <Stub className="home__stravaTicket" kind="ticket" tiltDeg={-4} tone="ochre">
            <span className="strava__sealKey">This year</span>
            <span className="strava__sealValue">{formatMiles(thisYear.distanceMeters)} mi</span>
          </Stub>
        </li>
        <li>
          <Stub className="home__stravaStamp" kind="stamp" tiltDeg={5} tone="chartreuse">
            <span className="strava__sealKey">Climbed</span>
            <span className="strava__sealValue">
              {formatCompactFeet(thisYear.elevationGainMeters)} ft
            </span>
          </Stub>
        </li>
      </ul>
    </div>
  );
}
