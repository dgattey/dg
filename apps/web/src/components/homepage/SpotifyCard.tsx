import { ContentCard } from 'ui/dependent/ContentCard';
import { useData } from 'api/useData';
import { TrackListing } from 'components/spotify/TrackListing';

/**
 * Shows a card with the latest data from Spotify
 */
export function SpotifyCard() {
  const { data: track } = useData('latest/song');
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
      <TrackListing hasLogo track={track} />
    </ContentCard>
  );
}
