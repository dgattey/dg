'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';
import { useAlbumGradient } from './useAlbumGradient';

const collageCardSx: SxObject = { gridArea: 'sp', scrollMarginTop: 120 };

/**
 * Collage Spotify card wrapper that subscribes to live NowPlayingContext
 * updates and tints the card with the album art's gradient.
 */
export function SpotifyCollageCard({ track: serverTrack }: { track: Track | null }) {
  const track = useNowPlaying(serverTrack);
  return track ? <CollageCardWithGradient track={track} /> : null;
}

function CollageCardWithGradient({ track }: { track: Track }) {
  const trackWithGradient = useAlbumGradient(track);
  return (
    <Box className="home__spotifySlot" id={NOW_PLAYING_CARD_ID} sx={collageCardSx}>
      <TrackListing surface="collage" track={trackWithGradient} />
    </Box>
  );
}
