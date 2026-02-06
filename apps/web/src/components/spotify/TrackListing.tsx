import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Stack } from '@mui/material';
import { AlbumImage } from './AlbumImage';
import { ArtistList } from './ArtistList';
import { getContrastColors } from './contrastColors';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { SpotifyLogo } from './SpotifyLogo';
import { TrackTitle } from './TrackTitle';

type TrackListingProps = {
  /**
   * If this is true, it puts a logo to the left of the album art
   */
  hasLogo?: boolean;
  /**
   * Color for music notes when playing (e.g. from card gradient)
   */
  noteColor?: string;
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
export function TrackListing({ track, hasLogo, noteColor }: TrackListingProps) {
  const trackUrl = track.externalUrls.spotify;
  const { name: trackTitle } = track;
  const contrast = getContrastColors(track.albumGradientIsDark);
  const { primaryColor, subtitleColor, primaryShadow, subtitleShadow } = contrast ?? {};
  return (
    <Stack sx={layoutSx}>
      <Stack direction="row" sx={headerSx}>
        {hasLogo ? (
          <SpotifyLogo
            color={primaryColor}
            textShadow={primaryShadow}
            trackTitle={trackTitle}
            url={trackUrl}
          />
        ) : null}
        <AlbumImage isPlaying={Boolean(track.isPlaying)} noteColor={noteColor} track={track} />
      </Stack>
      <Stack>
        <PlaybackStatus
          color={primaryColor}
          isPlaying={track.isPlaying}
          playedAt={track.playedAt}
          relativePlayedAt={track.relativePlayedAt}
          textShadow={primaryShadow}
        />
        <TrackTitle
          color={primaryColor}
          maxLines={track.playedAt ? 2 : 1}
          sx={trackTitleSx}
          textShadow={primaryShadow}
          trackTitle={trackTitle}
          url={trackUrl}
        />
        <ArtistList artists={track.artists} color={subtitleColor} textShadow={subtitleShadow} />
        <PlaybackProgressBar
          durationMs={track.durationMs}
          isDark={track.albumGradientIsDark}
          isPlaying={track.isPlaying}
          progressMs={track.progressMs}
        />
      </Stack>
    </Stack>
  );
}
