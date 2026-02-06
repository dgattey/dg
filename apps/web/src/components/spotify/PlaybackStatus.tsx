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
  const isNowPlaying = isPlaying ?? !playedAt;
  const relativeLastPlayed = isNowPlaying ? null : relativePlayedAt;

  const bounceRef = useWaveformBounce<HTMLSpanElement>({
    intensity: 0.8, // Slightly smaller bounce for the icon
    isPlaying: isNowPlaying,
  });

  if (!isNowPlaying && !relativeLastPlayed) {
    return null;
  }

  return (
    <Typography component="div" sx={getStatusSx(color, textShadow)} variant="overline">
      {isNowPlaying ? (
        <>
          Now Playing{' '}
          <Box component="span" ref={bounceRef} sx={iconWrapperSx}>
            <Music size="1.25em" />
          </Box>
        </>
      ) : (
        `Played ${relativeLastPlayed}`
      )}
    </Typography>
  );
}
