import type { Track } from 'api/types/spotify/Track';
import { useRelativeTimeFormat } from 'hooks/useRelativeTimeFormat';
import { Music } from 'lucide-react';
import { HorizontalStack } from 'ui/HorizontalStack';
import { Typography } from '@mui/material';

type PlaybackStatusProps = {
  playedAt?: Track['played_at'];
};

/**
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was.
 */
export function PlaybackStatus({ playedAt }: PlaybackStatusProps) {
  const isNowPlaying = !playedAt;
  const relativeLastPlayed = useRelativeTimeFormat({ fromDate: playedAt, capitalized: true });
  return (
    <Typography
      variant="overline"
      component={HorizontalStack}
      sx={{ gap: 1, alignItems: 'center' }}
    >
      {isNowPlaying ? (
        <>
          Now Playing
          <Music size="1.25em" />
        </>
      ) : (
        `Played ${relativeLastPlayed}`
      )}
    </Typography>
  );
}
