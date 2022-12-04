import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import TrackListing from 'components/spotify/TrackListing';
import styled from 'styled-components';

// Stacks content and takes up space of parent
const Card = styled(ContentCard)`
  padding: var(--spacing);
`;

/**
 * Shows a card with the latest data from Spotify
 */
const SpotifyCard = () => {
  const { data: track } = useData('latest/track');
  if (!track) {
    return null;
  }

  return (
    <Card>
      <TrackListing track={track} hasLogo />
    </Card>
  );
};

export default SpotifyCard;
