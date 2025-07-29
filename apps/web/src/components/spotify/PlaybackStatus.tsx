import { Typography } from '@mui/material';
import type { Track } from 'api/spotify/Track';
import { Music } from 'lucide-react';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import { useRelativeTimeFormat } from 'ui/helpers/useRelativeTimeFormat';

type PlaybackStatusProps = {
  playedAt?: Track['played_at'];
};

/**
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was.
 */
export function PlaybackStatus({ playedAt }: PlaybackStatusProps) {
  const isNowPlaying = !playedAt;
  const relativeLastPlayed = useRelativeTimeFormat({
    capitalized: true,
    fromDate: playedAt,
  });
  return (
    <Typography
      component={HorizontalStack}
      sx={{ alignItems: 'center', gap: 1 }}
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
