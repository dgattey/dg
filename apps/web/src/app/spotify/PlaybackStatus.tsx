'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
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
}: {
  isNowPlaying: boolean;
  playedAt: Date | string | undefined;
}) {
  if (isNowPlaying) return 'Now playing';
  if (playedAt)
    return (
      <>
        Played <RelativeTime date={playedAt} />
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
}: PlaybackStatusProps) {
  const isNowPlaying = isPlaying ?? !playedAt;
  const shouldAnimate = animating ?? isNowPlaying;
  const isCompact = listingVariant === 'compact';

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8,
    isPlaying: shouldAnimate,
  });

  const statusContent = <StatusText isNowPlaying={isNowPlaying} playedAt={playedAt} />;
  const iconSize = isCompact ? '1em' : '1.25em';

  return (
    <Typography
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
