import type { CSSProperties } from 'react';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);

function SkeletonLine({
  height,
  maxWidth,
  width,
}: {
  height?: string;
  maxWidth?: string;
  width?: string;
}) {
  const vars: CSSProperties & Record<`--${string}`, string> = {};
  if (height) vars['--skeleton-h'] = height;
  if (maxWidth) vars['--skeleton-max-w'] = maxWidth;
  if (width) vars['--skeleton-w'] = width;
  return (
    <span
      aria-hidden="true"
      className="music__skeleton music__skeletonText"
      data-skeleton=""
      style={Object.keys(vars).length > 0 ? vars : undefined}
    />
  );
}

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
        <SkeletonLine maxWidth="320px" width="55%" />
        <SkeletonLine height="28px" maxWidth="380px" width="65%" />
      </div>
      <div className="music__wellTracks">
        {PLACEHOLDER_TRACKS.map((track) => (
          <div
            className="music__wellTrack music__wellTrackSkeleton"
            data-role="track-row-skeleton"
            key={track}
          >
            <SkeletonLine />
            <div className="music__wellTrackBody">
              <SkeletonLine width="70%" />
              <SkeletonLine height="16px" width="45%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
