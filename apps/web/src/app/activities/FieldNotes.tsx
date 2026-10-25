'use client';

import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import type { TileSource } from '@dg/maps/src/tileSource';
import { PaperTag } from '../collage/PaperTag';
import { Scallop } from '../music/stats/StatsShapes';
import { HeadlineTotals } from './FilteredSections';
import { RoutePolaroid } from './RoutePolaroid';
import { useFilteredOutings } from './StravaFilters';

const RECENT_PRINTS = 3;
const PRINT_TILTS = [2.4, -2.2] as const;

export function FieldNotes({
  history,
  tileSource,
}: {
  history: Pick<StravaHistory, 'latest' | 'outings'>;
  tileSource: TileSource;
}) {
  const { outings } = useFilteredOutings();
  const prints = (outings.length > 0 ? outings : history.outings).slice(0, RECENT_PRINTS);
  const [first, ...earlier] = prints;
  const isLatest = first?.id === history.latest.id;
  return (
    <div className="strava__field">
      <HeadlineTotals />
      <section aria-label="Recent routes" className="strava__recentRoutes">
        <h2 className="strava__tagHeading">
          <PaperTag tiltDeg={-2} tone="black">
            Recent routes
          </PaperTag>
        </h2>
        {first ? (
          <RoutePolaroid
            className="strava__recentPrint"
            dated
            note={isLatest ? history.latest.description : null}
            outing={first}
            tileSource={tileSource}
            tiltDeg={-1.4}
          >
            {isLatest ? (
              <Scallop className="strava__latestSeal" size="sticker" tiltDeg={12} tone="vermilion">
                <span className="strava__sealKey" data-typography="meta">
                  Latest
                </span>
              </Scallop>
            ) : null}
          </RoutePolaroid>
        ) : null}
        {earlier.length > 0 ? (
          <div className="strava__recentPair">
            {earlier.map((outing, index) => (
              <RoutePolaroid
                className="strava__recentPrint"
                dated
                key={outing.id}
                outing={outing}
                tileSource={tileSource}
                tiltDeg={PRINT_TILTS[index % PRINT_TILTS.length] ?? 0}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
