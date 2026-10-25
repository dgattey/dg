import { Skeleton } from '@dg/ui/core/Skeleton';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);
const LINE_CLASS = 'music__skeleton music__skeletonText';

/**
 * Holds the well open at roughly its loaded height while the tracklist streams
 * in, so the grid below does not jump once it lands.
 *
 * `data-role="album-detail-placeholder"` is what the well's height reserve keys
 * off: while this is on screen the well is floored at the height the previous
 * album measured, and its removal is what releases that floor.
 */
export function AlbumDetailBodySkeleton() {
  return (
    <div className="music__wellPlaceholder" data-role="album-detail-placeholder">
      <div className="music__wellMeta">
        <Skeleton className={LINE_CLASS} maxWidth="320px" width="55%" />
        <Skeleton className={LINE_CLASS} height="28px" maxWidth="380px" width="65%" />
      </div>
      <div className="music__wellTracks">
        {PLACEHOLDER_TRACKS.map((track) => (
          <div
            className="music__wellTrack music__wellTrackSkeleton"
            data-role="track-row-skeleton"
            key={track}
          >
            <Skeleton className={LINE_CLASS} />
            <div className="music__wellTrackBody">
              <Skeleton className={LINE_CLASS} width="70%" />
              <Skeleton className={LINE_CLASS} height="16px" width="45%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
