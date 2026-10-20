'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { TooltipPlacement } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import type { SxObject } from '@dg/ui/theme';
import { Music } from 'lucide-react';
import { useWaveformBounce } from './useWaveformBounce';

type ListingVariant = 'card' | 'compact';

type PlaybackStatusProps = {
  isPlaying?: Track['isPlaying'];
  playedAt?: Track['playedAt'];
  color?: string;
  textShadow?: string;
  /** Override animation state separately from playback status. Defaults to matching isPlaying. */
  animating?: boolean;
  listingVariant?: ListingVariant;
  /** Names where it's playing, trading the relative time for a plain "recently played". */
  service?: string;
};

function getStatusSx(
  listingVariant: ListingVariant,
  color?: string,
  textShadow?: string,
): SxObject {
  const isCompact = listingVariant === 'compact';
  return {
    alignItems: 'center',
    color,
    display: 'flex',
    gap: isCompact ? 0.5 : 1,
    textShadow,
    ...(isCompact ? { lineHeight: 1.2, minWidth: 0, width: '100%' } : {}),
  };
}

const iconWrapperSx: SxObject = {
  backfaceVisibility: 'hidden',
  display: 'inline-flex',
  flexShrink: 0,
};

const compactTextSx: SxObject = {
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
  animating,
  listingVariant = 'card',
  service,
}: PlaybackStatusProps) {
  const isNowPlaying = isPlaying ?? !playedAt;
  const shouldAnimate = animating ?? isNowPlaying;
  const isCompact = listingVariant === 'compact';

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8,
    isPlaying: shouldAnimate,
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
      className="chrome__nowPlayingStatus"
      component="div"
      sx={getStatusSx(listingVariant, color, textShadow)}
      variant="overline"
    >
      {isCompact ? (
        <Box component="span" sx={compactTextSx}>
          {statusContent}
        </Box>
      ) : (
        <span>{statusContent}</span>
      )}
      {isNowPlaying ? (
        <Box component="span" ref={bounceRef} sx={iconWrapperSx}>
          <Music size={iconSize} />
        </Box>
      ) : null}
    </Typography>
  );
}
