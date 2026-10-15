'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { useNowPlaying } from './NowPlayingContext';
import { SpotifyCardScrollTracker } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

const collageTrackerSx: SxObject = { gridArea: 'sp' };

/**
 * Lightweight collage Spotify card wrapper that subscribes to live NowPlayingContext
 * updates and tracks scroll position without pulling in gradient extraction or
 * classic card chrome.
 */
export function SpotifyCollageCard({ track: serverTrack }: { track: Track | null }) {
  const track = useNowPlaying(serverTrack);
  if (!track) {
    return null;
  }
  return (
    <SpotifyCardScrollTracker sx={collageTrackerSx}>
      <TrackListing surface="collage" track={track} />
    </SpotifyCardScrollTracker>
  );
}
