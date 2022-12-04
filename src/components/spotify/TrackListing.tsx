import { Track } from 'api/types/spotify/Track';
import Stack from 'components/Stack';
import truncated from 'helpers/truncated';
import styled from '@emotion/styled';
import AlbumImage from './AlbumImage';
import ArtistList from './ArtistList';
import Logo from './Logo';
import PlaybackStatus from './PlaybackStatus';
import TrackTitle from './TrackTitle';

interface Props {
  /**
   * Has to exist, the track to list
   */
  track: Track;

  /**
   * If this is true, it puts a logo to the left of the album art
   */
  hasLogo?: boolean;
}

const Container = styled(Stack)`
  height: 100%;
  width: 100%;
`;

// Used to wrap content, the last item truncates on one line instead of 2 + makes sure there's no change in line height
const Header = styled.h5`
  --typography-spacing-vertical: 0.25em;
  ${truncated(2)}
  &:last-child {
    ${truncated(1)}
    height: calc(var(--line-height) * 1rem);
  }
`;

// Ensures there's some bottom spacing + the last item is less emphasized
const TextGroup = styled.hgroup`
  --typography-spacing-vertical: 0.5rem;
`;

// Contents should shrink if they need to!
const ShrinkStack = styled(Stack)`
  flex: 1;
`;

/**
 * Shows a listing for one track, with an optional logo to the left of the album art,
 * plus support for sizing the album art. For responsive album art, this needs to take
 * up the full height of its parent!
 */
function TrackListing({ track, hasLogo }: Props) {
  const metadata = (
    <div>
      <Header>
        <PlaybackStatus {...track} />
      </Header>
      <TextGroup>
        <Header>
          <TrackTitle {...track} />
        </Header>
        <Header>
          <ArtistList {...track} />
        </Header>
      </TextGroup>
    </div>
  );
  return (
    <Container $isVertical $justifyContent="space-between" $gap="0.5rem">
      <ShrinkStack $justifyContent="space-between">
        {hasLogo && <Logo {...track} />}
        <AlbumImage {...track} />
      </ShrinkStack>
      {metadata}
    </Container>
  );
}

export default TrackListing;
