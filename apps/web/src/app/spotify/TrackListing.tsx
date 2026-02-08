import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Stack } from '@mui/material';
import { AlbumImage } from './AlbumImage';
import { ArtistList } from './ArtistList';
import { getContrastingColors } from './colors';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { SpotifyLogo } from './SpotifyLogo';
import { TrackTitle } from './TrackTitle';

type TrackListingProps = {
  /**
   * Has to exist, the track to list
   */
  track: Track;
};

const layoutSx: SxObject = {
  flex: 1,
  gap: 1,
  justifyContent: 'space-between',
};

const headerSx: SxObject = {
  gap: 6,
  justifyContent: 'space-between',
};

const trackTitleSx: SxObject = {
  marginBottom: 1,
};

/**
 * Shows a listing for one track, with an optional logo to the left of the album art,
 * plus support for sizing the album art. For responsive album art, this needs to take
 * up the full height of its parent!
 */
export function TrackListing({ track }: TrackListingProps) {
  const trackUrl = track.externalUrls.spotify;
  const { name: trackTitle } = track;
  const colors = getContrastingColors(track);
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};
  return (
    <Stack sx={layoutSx}>
      <Stack direction="row" sx={headerSx}>
        <SpotifyLogo
          color={primary}
          textShadow={primaryShadow}
          trackTitle={trackTitle}
          url={trackUrl}
        />
        <AlbumImage isPlaying={Boolean(track.isPlaying)} track={track} />
      </Stack>
      <Stack>
        <PlaybackStatus
          color={primary}
          isPlaying={track.isPlaying}
          playedAt={track.playedAt}
          relativePlayedAt={track.relativePlayedAt}
          textShadow={primaryShadow}
        />
        <TrackTitle
          color={primary}
          maxLines={track.playedAt ? 2 : 1}
          sx={trackTitleSx}
          textShadow={primaryShadow}
          trackTitle={trackTitle}
          url={trackUrl}
        />
        <ArtistList artists={track.artists} color={secondary} textShadow={secondaryShadow} />
        <PlaybackProgressBar
          colors={colors}
          durationMs={track.durationMs}
          isPlaying={track.isPlaying}
          progressMs={track.progressMs}
        />
      </Stack>
    </Stack>
  );
}
