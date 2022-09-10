import type { Track } from '@dg/api/types/spotify/Track';
import Stack from '@dg/components/Stack';
import useRelativeTimeFormat from '@dg/hooks/useRelativeTimeFormat';
import { Music } from 'lucide-react';
import styled from 'styled-components';

type Props = Track;

// Small text + icon for the status
const Container = styled(Stack)`
  text-transform: uppercase;
  font-size: 0.65rem;
  margin-bottom: 0.25rem;
`;

/**
 * Creates an element that shows if Spotify is currently playing, or if not,
 * when it last was.
 */
const PlaybackStatus = ({ played_at }: Props) => {
  const lastPlayed = played_at ?? null;
  const relativeLastPlayed = useRelativeTimeFormat(lastPlayed);
  return (
    <Container $alignItems="center" $gap="0.4rem">
      {lastPlayed ? (
        `Played ${relativeLastPlayed}`
      ) : (
        <>
          Now Playing
          <Music size="1em" />
        </>
      )}
    </Container>
  );
};

export default PlaybackStatus;
