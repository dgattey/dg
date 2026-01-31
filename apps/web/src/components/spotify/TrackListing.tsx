import type { Track } from '@dg/services/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Stack } from '@mui/material';
import { AlbumImage } from './AlbumImage';
import { ArtistList } from './ArtistList';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { SpotifyLogo } from './SpotifyLogo';
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
export function TrackListing({ track, hasLogo }: TrackListingProps) {
  const trackUrl = track.external_urls.spotify;
  const { name: trackTitle } = track;
  const gradientIsDark = track.albumGradientIsDark;
  const contrastStyles =
    gradientIsDark === undefined
      ? undefined
      : {
          primaryShadow: gradientIsDark
            ? '0 1px 3px rgba(0, 0, 0, 0.25)'
            : '0 1px 3px rgba(255, 255, 255, 0.25)',
          primaryTextColor: gradientIsDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          subtitleColor: gradientIsDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          subtitleShadow: gradientIsDark
            ? '0 1px 3px rgba(0, 0, 0, 0.18)'
            : '0 1px 3px rgba(255, 255, 255, 0.18)',
        };
  const { primaryTextColor, subtitleColor, primaryShadow, subtitleShadow } = contrastStyles ?? {};
  return (
    <Stack sx={layoutSx}>
      <Stack direction="row" sx={headerSx}>
        {hasLogo ? (
          <SpotifyLogo
            color={primaryTextColor}
            textShadow={primaryShadow}
            trackTitle={trackTitle}
            url={trackUrl}
          />
        ) : null}
        <AlbumImage album={track.album} />
      </Stack>
      <Stack>
        <PlaybackStatus
          color={primaryTextColor}
          playedAt={track.played_at}
          relativePlayedAt={track.relativePlayedAt}
          textShadow={primaryShadow}
        />
        <TrackTitle
          color={primaryTextColor}
          sx={trackTitleSx}
          textShadow={primaryShadow}
          trackTitle={trackTitle}
          url={trackUrl}
        />
        <ArtistList artists={track.artists} color={subtitleColor} textShadow={subtitleShadow} />
        <PlaybackProgressBar
          durationMs={track.duration_ms}
          isDark={track.albumGradientIsDark}
          isPlaying={track.is_playing}
          progressMs={track.progress_ms}
        />
      </Stack>
    </Stack>
  );
}
