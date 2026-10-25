'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Typography } from '@dg/ui/core/Typography';
import { Music } from 'lucide-react';
import type { CSSProperties } from 'react';
import { isTrackNowPlaying, PlaybackStatusText } from './PlaybackStatusText';
import { useWaveformBounce } from './useWaveformBounce';

type ListingVariant = 'card' | 'compact';

type PlaybackStatusProps = {
  isPlaying?: Track['isPlaying'];
  playedAt?: Track['playedAt'];
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
};

/**
 * Shows playback status text with a bouncing music icon when playing.
 * Styling is driven by the parent TrackListing's variant.
 */
export function PlaybackStatus({
  isPlaying,
  playedAt,
  color,
  textShadow,
  listingVariant = 'card',
}: PlaybackStatusProps) {
  const isNowPlaying = isTrackNowPlaying({ isPlaying, playedAt });
  const isCompact = listingVariant === 'compact';

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8,
    isPlaying: isNowPlaying,
  });

  // The card's title sits right under the status, so its hint opens upward.
  const statusContent = (
    <PlaybackStatusText
      isPlaying={isPlaying}
      playedAt={playedAt}
      tooltipPlacement={isCompact ? 'bottom' : 'top'}
    />
  );
  const iconSize = isCompact ? '1em' : '1.25em';
  const statusVars = textShadow ? ({ '--status-shadow': textShadow } as CSSProperties) : undefined;

  return (
    <Typography
      color={color}
      component="div"
      data-playback-status={listingVariant}
      style={statusVars}
      variant="overline"
    >
      {isCompact ? (
        <span data-playback-status-compact-text="">{statusContent}</span>
      ) : (
        <span>{statusContent}</span>
      )}
      {isNowPlaying ? (
        <span data-playback-status-icon="" ref={bounceRef}>
          <Music size={iconSize} />
        </span>
      ) : null}
    </Typography>
  );
}
