import { Stack } from '@mui/material';
import { HorizontalStack } from 'ui/core/HorizontalStack';
import type { Track } from 'api/spotify/Track';
import { AlbumImage } from './AlbumImage';
import { ArtistList } from './ArtistList';
import { SpotifyLogo } from './SpotifyLogo';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';

type TrackListingProps = {
  /**
   * Has to exist, the track to list
   */
  track: Track;

  /**
   * If this is true, it puts a logo to the left of the album art
   */
  hasLogo?: boolean;
};

/**
 * Shows a listing for one track, with an optional logo to the left of the album art,
 * plus support for sizing the album art. For responsive album art, this needs to take
 * up the full height of its parent!
 */
export function TrackListing({ track, hasLogo }: TrackListingProps) {
  const trackUrl = track.external_urls.spotify;
  const { name: trackTitle } = track;
  return (
    <Stack
      sx={{
        flex: 1,
        gap: 1,
        justifyContent: 'space-between',
      }}
    >
      <HorizontalStack
        sx={{
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        {hasLogo ? <SpotifyLogo trackTitle={trackTitle} url={trackUrl} /> : null}
        <AlbumImage album={track.album} />
      </HorizontalStack>
      <Stack>
        <PlaybackStatus playedAt={track.played_at} />
        <TrackTitle sx={{ marginBottom: 1 }} trackTitle={trackTitle} url={trackUrl} />
        <ArtistList artists={track.artists} />
      </Stack>
    </Stack>
  );
}
