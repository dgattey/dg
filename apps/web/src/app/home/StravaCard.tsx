import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import { RoutePeek } from '@dg/maps/RoutePeek';
import { getTileSource } from '@dg/maps/src/getTileSource';
import { activitiesRoute } from '@dg/shared-core/routes/app';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { formatShare, summarizeCoverage } from '../activities/coverageStats';
import { RoutePolaroid } from '../activities/RoutePolaroid';
import { distanceComparison } from '../activities/stravaComparisons';
import { formatCompactFeet, formatMiles, formatRouteCount } from '../activities/stravaFormat';
import { SPORT_DETAILS, toMapRoutes } from '../activities/stravaSports';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';

/**
 * The homepage's Strava gatefold: every route around home up top, linking to
 * `/activities` with the lifetime total sealed on its corner, the latest outing's
 * print stepped down beside this year's miles and San Francisco street coverage.
 */
export function StravaCard({ history }: { history: StravaHistory | null }) {
  if (!history) {
    return null;
  }
  const { latest, outings, streetCoverage, thisYear, totals } = history;
  const routes = toMapRoutes(outings);
  const comparison = distanceComparison(totals.distanceMeters);
  const sfCoverage = summarizeCoverage(streetCoverage.sf, 'all', 'all');
  const sfShare = sfCoverage.city.streetMeters > 0 ? formatShare(sfCoverage.city.share) : null;
  return (
    <div className="home__strava" data-slot="st">
      <div className="home__stravaAtlas collageLift">
        <PageTransitionLink
          className="home__stravaAtlasLink"
          href={activitiesRoute}
          title="Big map"
        >
          <h2 className="home__stravaHeading">
            <PaperTag className="collageEyebrow" tiltDeg={-3} tone="viridian">
              Big map
            </PaperTag>
          </h2>
          <PaperCard edge="quad-c" innerClassName="home__stravaAtlasMat" tiltDeg={1.6}>
            <span aria-hidden="true" className="home__stravaMap">
              <RoutePeek routes={routes} />
            </span>
            <span className="home__stravaFooter">
              <span className="home__stravaSummary">
                <span className="home__stravaComparison" data-typography="title-md">
                  {comparison.figure} {comparison.unit}
                </span>
                <span className="home__stravaMeta" data-typography="row-title">
                  <span>{formatRouteCount(routes.length)}</span>
                  <span>{formatCompactFeet(totals.elevationGainMeters)} ft climbed</span>
                </span>
              </span>
              <span className="home__stravaExplore" data-typography="badge">
                Explore big map →
              </span>
            </span>
          </PaperCard>
          <Scallop className="home__stravaTotal" size="sticker" tiltDeg={8} tone="rose">
            <span className="strava__sealKey" data-typography="meta">
              Total
            </span>
            <span data-typography="label">{formatMiles(totals.distanceMeters)} mi</span>
          </Scallop>
        </PageTransitionLink>
      </div>
      <RoutePolaroid
        className="home__stravaLatest"
        outing={latest}
        tileSource={getTileSource()}
        tiltDeg={-1.8}
      >
        <Scallop className="home__stravaWhen" size="sticker" tiltDeg={10} tone="vermilion">
          <span className="strava__sealKey" data-typography="caption">
            {SPORT_DETAILS[latest.sport].latest}
          </span>
          <span data-typography="label">
            <RelativeTime date={latest.startDate} hasTooltip={false} isCapitalized />
          </span>
        </Scallop>
      </RoutePolaroid>
      <div className="home__stravaSide">
        {sfShare ? (
          <Stub kind="stamp" size="sm" tiltDeg={2.4} tone="cream">
            <span className="strava__sealKey" data-typography="meta">
              SF streets
            </span>
            <span data-typography="title-md">{sfShare}</span>
          </Stub>
        ) : null}
        <Stub kind="ticket" size="sm" tiltDeg={-3.2} tone="ochre">
          <span className="strava__sealKey" data-typography="meta">
            This year
          </span>
          <span data-typography="title-md">{formatMiles(thisYear.distanceMeters)} mi</span>
        </Stub>
      </div>
    </div>
  );
}
