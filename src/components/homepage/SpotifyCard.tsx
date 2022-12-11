import { useData } from 'api/useData';
import { ContentCard } from 'components/ContentCard';
import { TrackListing } from 'components/spotify/TrackListing';

/**
 * Shows a card with the latest data from Spotify
 */
export function SpotifyCard() {
  const { data: track } = useData('latest/track');
  if (!track) {
    return null;
  }

  return (
    <ContentCard
      sx={{
        padding: 2.5,
        display: 'flex',
      }}
    >
      <TrackListing track={track} hasLogo />
    </ContentCard>
  );
}
