import type { Track } from '@dg/content-models/spotify/Track';
import { ArtistList } from './ArtistList';
import type { Colors } from './colors';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';

/** Status, title, artists, and progress for the full-size track card. */
export function TrackCardMeta({
  track,
  colors,
  service,
  textShadow,
}: {
  track: Track;
  colors: Colors | null;
  service?: string;
  textShadow?: boolean;
}) {
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};
  const trackUrl = track.externalUrls.spotify;
  const shadows = textShadow !== false;

  return (
    <>
      <PlaybackStatus
        color={primary}
        isPlaying={track.isPlaying}
        listingVariant="card"
        playedAt={track.playedAt}
        service={service}
        textShadow={shadows ? primaryShadow : undefined}
      />
      <TrackTitle
        color={primary}
        listingVariant="card"
        textShadow={shadows ? primaryShadow : undefined}
        trackTitle={track.name}
        url={trackUrl}
      />
      <ArtistList
        artists={track.artists}
        color={secondary}
        listingVariant="card"
        textShadow={shadows ? secondaryShadow : undefined}
      />
      <PlaybackProgressBar
        colors={colors}
        durationMs={track.durationMs}
        isPlaying={track.isPlaying}
        progressMs={track.progressMs}
      />
    </>
  );
}
