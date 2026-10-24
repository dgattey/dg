'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { TooltipPlacement } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Music } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useWaveformBounce } from './useWaveformBounce';

type ListingVariant = 'card' | 'compact';

type PlaybackStatusProps = {
  isPlaying?: Track['isPlaying'];
  playedAt?: Track['playedAt'];
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
  /** Names where it's playing, trading the relative time for a plain "recently played". */
  service?: string;
};

function getStatusStyle(
  listingVariant: ListingVariant,
  color?: string,
  textShadow?: string,
): CSSProperties {
  const isCompact = listingVariant === 'compact';
  return {
    alignItems: 'center',
    color,
    display: 'flex',
    gap: isCompact ? 4 : 8,
    textShadow,
    ...(isCompact ? { lineHeight: 1.2, minWidth: 0, width: '100%' } : {}),
  };
}

const iconWrapperStyle: CSSProperties = {
  backfaceVisibility: 'hidden',
  display: 'inline-flex',
  flexShrink: 0,
};

const compactTextStyle: CSSProperties = {
  flexShrink: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * The actual text/relative time to display for the status.
 */
function StatusText({
  isNowPlaying,
  playedAt,
  service,
  tooltipPlacement,
}: {
  isNowPlaying: boolean;
  playedAt: Date | string | undefined;
  service: string | undefined;
  tooltipPlacement: TooltipPlacement;
}) {
  if (service) return `${isNowPlaying ? 'Now playing' : 'Recently played'} on ${service}`;
  if (isNowPlaying) return 'Now playing';
  if (playedAt)
    return (
      <>
        Played <RelativeTime date={playedAt} tooltipPlacement={tooltipPlacement} />
      </>
    );
  return 'Just played';
}

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
  service,
}: PlaybackStatusProps) {
  const isNowPlaying = isPlaying ?? !playedAt;
  const isCompact = listingVariant === 'compact';

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8,
    isPlaying: isNowPlaying,
  });

  // The card's title sits right under the status, so its hint opens upward.
  const statusContent = (
    <StatusText
      isNowPlaying={isNowPlaying}
      playedAt={playedAt}
      service={service}
      tooltipPlacement={isCompact ? 'bottom' : 'top'}
    />
  );
  const iconSize = isCompact ? '1em' : '1.25em';

  return (
    <Typography
      component="div"
      style={getStatusStyle(listingVariant, color, textShadow)}
      variant="overline"
    >
      {isCompact ? (
        <span style={compactTextStyle}>{statusContent}</span>
      ) : (
        <span>{statusContent}</span>
      )}
      {isNowPlaying ? (
        <span ref={bounceRef} style={iconWrapperStyle}>
          <Music size={iconSize} />
        </span>
      ) : null}
    </Typography>
  );
}
