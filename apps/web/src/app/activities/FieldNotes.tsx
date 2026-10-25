import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import type { TileSource } from '@dg/maps/src/tileSource';
import { PaperTag } from '../collage/PaperTag';
import { Scallop } from '../music/stats/StatsShapes';
import { HeadlineTotals } from './FilteredSections';
import { RoutePolaroid } from './RoutePolaroid';

const RECENT_PRINTS = 3;
const PRINT_TILTS = [2.4, -2.2] as const;

/**
 * The column beside the atlas: totals for whatever the filters pick, then the
 * newest outings as captioned polaroids, the latest first with its note.
 */
export function FieldNotes({
  history,
  tileSource,
}: {
  history: Pick<StravaHistory, 'latest' | 'outings'>;
  tileSource: TileSource;
}) {
  const { latest } = history;
  const earlier = history.outings.slice(1, RECENT_PRINTS);
  return (
    <div className="strava__field">
      <HeadlineTotals />
      <section aria-label="Recent routes" className="strava__recentRoutes">
        <h2 className="strava__tagHeading">
          <PaperTag tiltDeg={-2} tone="black">
            Recent routes
          </PaperTag>
        </h2>
        <RoutePolaroid
          className="strava__recentPrint"
          dated
          note={latest.description}
          outing={latest}
          tileSource={tileSource}
          tiltDeg={-1.4}
        >
          <Scallop className="strava__latestSeal" size="sticker" tiltDeg={12} tone="vermilion">
            <span className="strava__sealKey" data-typography="meta">
              Latest
            </span>
          </Scallop>
        </RoutePolaroid>
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
