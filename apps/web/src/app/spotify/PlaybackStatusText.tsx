'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { TooltipPlacement } from '@dg/ui/core/Tooltip';

type PlaybackTiming = Pick<Track, 'isPlaying' | 'playedAt'>;

/**
 * A track with no `playedAt` hasn't finished yet, so it counts as playing unless told otherwise.
 */
export function isTrackNowPlaying({ isPlaying, playedAt }: PlaybackTiming): boolean {
  return isPlaying ?? !playedAt;
}

type PlaybackStatusTextProps = PlaybackTiming & {
  /** Off where an enclosing tooltip already describes the track. Defaults to true. */
  hasTooltip?: boolean;
  tooltipPlacement?: TooltipPlacement;
};

/**
 * The one wording for playback status everywhere a track shows: "Now playing" or "Played 3 hours ago".
 */
export function PlaybackStatusText({
  isPlaying,
  playedAt,
  hasTooltip = true,
  tooltipPlacement,
}: PlaybackStatusTextProps) {
  if (isTrackNowPlaying({ isPlaying, playedAt })) return 'Now playing';
  if (!playedAt) return 'Just played';
  return (
    <>
      Played{' '}
      <RelativeTime date={playedAt} hasTooltip={hasTooltip} tooltipPlacement={tooltipPlacement} />
    </>
  );
}
