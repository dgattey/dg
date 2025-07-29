import { useData } from 'api/useData';
import { ContentCard } from 'ui/dependent/ContentCard';
import { TrackListing } from '../spotify/TrackListing';

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
      sx={(theme) => ({
        display: 'flex',
        padding: 2.5,
        [theme.breakpoints.down('md')]: {
          minWidth: 'min(max-content, inherit)',
        },
      })}
    >
      <TrackListing hasLogo={true} track={track} />
    </ContentCard>
  );
}
