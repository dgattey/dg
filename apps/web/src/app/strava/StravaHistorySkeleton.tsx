import { PaperCard } from '../collage/PaperCard';
import { Scallop } from '../music/stats/StatsShapes';
import { AtlasSheet } from './StravaHistorySections';

/** Blank paper in the shape of the atlas and its notes, so the page holds still while they load. */
export function StravaHistorySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading outings" className="strava__sections" role="status">
      <div className="strava__atlas">
        <div className="strava__field">
          <PaperCard
            className="strava__note"
            edge="torn-c"
            innerClassName="strava__noteInner strava__noteInner--blank"
            tiltDeg={-1.6}
            tone="ochre"
          />
          <div className="strava__seals">
            <Scallop className="strava__seal" tiltDeg={-10} tone="ochre">
              {null}
            </Scallop>
            <Scallop
              className="strava__seal strava__seal--small"
              size="sticker"
              tiltDeg={9}
              tone="viridian"
            >
              {null}
            </Scallop>
          </div>
        </div>
        <AtlasSheet>
          <div className="strava__atlasBlank" />
        </AtlasSheet>
      </div>
    </div>
  );
}
