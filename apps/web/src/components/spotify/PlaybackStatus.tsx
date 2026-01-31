import type { Track } from '@dg/services/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { Music } from 'lucide-react';

type PlaybackStatusProps = {
  playedAt?: Track['played_at'];
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

/**
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was.
 */
export function PlaybackStatus({
  playedAt,
  relativePlayedAt,
  color,
  textShadow,
}: PlaybackStatusProps) {
  const isNowPlaying = !playedAt;
  const relativeLastPlayed = isNowPlaying ? null : relativePlayedAt;
  if (!isNowPlaying && !relativeLastPlayed) {
    return null;
  }
  return (
    <Typography component="div" sx={getStatusSx(color, textShadow)} variant="overline">
      {isNowPlaying ? (
        <>
          Now Playing <Music size="1.25em" />
        </>
      ) : (
        `Played ${relativeLastPlayed}`
      )}
    </Typography>
  );
}
