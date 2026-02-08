'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { Music } from 'lucide-react';
import { useWaveformBounce } from './useWaveformBounce';

type PlaybackStatusProps = {
  isPlaying?: Track['isPlaying'];
  playedAt?: Track['playedAt'];
  relativePlayedAt?: Track['relativePlayedAt'];
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
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was. The music icon bounces when playing.
 */
export function PlaybackStatus({
  isPlaying,
  playedAt,
  relativePlayedAt,
  color,
  textShadow,
}: PlaybackStatusProps) {
  if (relativePlayedAt && !playedAt) {
    throw new Error('relativePlayedAt requires playedAt to be set');
  }

  const isNowPlaying = isPlaying ?? !playedAt;
  const relativeLastPlayed = isNowPlaying ? null : relativePlayedAt;

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8, // Slightly smaller bounce for the icon
    isPlaying: isNowPlaying,
  });

  // Determine status text
  let statusText: string;
  if (isNowPlaying) {
    statusText = 'Now Playing';
  } else if (relativeLastPlayed) {
    statusText = `Played ${relativeLastPlayed}`;
  } else {
    statusText = 'Just Played';
  }

  return (
    <Typography component="div" sx={getStatusSx(color, textShadow)} variant="overline">
      {statusText}
      {isNowPlaying ? (
        <Box component="span" ref={bounceRef} sx={iconWrapperSx}>
          <Music size="1.25em" />
        </Box>
      ) : null}
    </Typography>
  );
}
