import { Music } from 'lucide-react';
import { Typography } from '@mui/material';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import type { Track } from 'api/server/spotify/Track';
import { useRelativeTimeFormat } from 'hooks/useRelativeTimeFormat';

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
      component={HorizontalStack}
      sx={{ gap: 1, alignItems: 'center' }}
      variant="overline"
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
