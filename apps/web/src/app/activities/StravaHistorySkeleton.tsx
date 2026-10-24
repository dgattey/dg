import { PaperCard } from '../collage/PaperCard';
import { AtlasSheet } from './StravaHistorySections';

/** Blank paper in the shape of the atlas and its notes, so the page holds still while they load. */
export function StravaHistorySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading activities"
      className="strava__sections"
      role="status"
    >
      <div className="strava__atlas">
        <div className="strava__field">
          <div className="strava__totals strava__totals--blank" />
          <PaperCard
            className="strava__recentPrint"
            edge="quad-a"
            innerClassName="strava__polaroidInner"
            tiltDeg={-1.4}
          >
            <span className="strava__print strava__printBlank" />
          </PaperCard>
        </div>
        <AtlasSheet>
          <div className="strava__atlasBlank" />
        </AtlasSheet>
      </div>
    </div>
  );
}
