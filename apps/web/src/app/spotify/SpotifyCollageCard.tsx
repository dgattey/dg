'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';

const collageCardSx: SxObject = { gridArea: 'sp', scrollMarginTop: 120 };

/**
 * Lightweight collage Spotify card wrapper that subscribes to live NowPlayingContext
 * updates without pulling in gradient extraction or classic card chrome.
 */
export function SpotifyCollageCard({ track: serverTrack }: { track: Track | null }) {
  const track = useNowPlaying(serverTrack);
  if (!track) {
    return null;
  }
  return (
    <Box id={NOW_PLAYING_CARD_ID} sx={collageCardSx}>
      <TrackListing surface="collage" track={track} />
    </Box>
  );
}
