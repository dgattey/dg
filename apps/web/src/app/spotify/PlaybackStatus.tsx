'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { RelativeTime } from '@dg/ui/core/RelativeTime';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { Music } from 'lucide-react';
import { useWaveformBounce } from './useWaveformBounce';

type PlaybackStatusProps = {
  isPlaying?: Track['isPlaying'];
  playedAt?: Track['playedAt'];
  color?: string;
  textShadow?: string;
};

const getStatusSx = (color?: string, textShadow?: string): SxObject => ({
  alignItems: 'center',
  color,
  display: 'flex',
  gap: 1,
  textShadow,
});

const iconWrapperSx: SxObject = {
  backfaceVisibility: 'hidden',
  display: 'inline-flex',
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
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was. The music icon bounces when playing.
 */
export function PlaybackStatus({ isPlaying, playedAt, color, textShadow }: PlaybackStatusProps) {
  const isNowPlaying = isPlaying ?? !playedAt;

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8, // Slightly smaller bounce for the icon
    isPlaying: isNowPlaying,
  });

  return (
    <Typography component="div" sx={getStatusSx(color, textShadow)} variant="overline">
      <span>
        <StatusText isNowPlaying={isNowPlaying} playedAt={playedAt} />
      </span>
      {isNowPlaying ? (
        <Box component="span" ref={bounceRef} sx={iconWrapperSx}>
          <Music size="1.25em" />
        </Box>
      ) : null}
    </Typography>
  );
}
