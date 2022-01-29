import type { Track } from 'api/types/spotify/Track';
import Stack from 'components/Stack';
import useRelativeTimeFormat from 'hooks/useRelativeTimeFormat';
import { FiMusic } from 'react-icons/fi';
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
    <Container $alignItems="center" $gap="4px">
      {lastPlayed ? (
        `Played ${relativeLastPlayed}`
      ) : (
        <>
          Now Playing
          <FiMusic />
        </>
      )}
    </Container>
  );
};

export default PlaybackStatus;
