import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import type { SxObject } from '@dg/ui/theme';
import type { CSSProperties } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import { ALBUM_GRADIENT_GLOW_SX, AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { ArtistList } from './ArtistList';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';

type Colors = {
  primary: string;
  primaryShadow: string;
  secondary: string;
  secondaryShadow: string;
};

const CONTRASTING_COLORS: Record<'light' | 'dark', Colors> = {
  dark: {
    primary: 'rgba(255, 255, 255, 0.7)',
    primaryShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    secondary: 'rgba(255, 255, 255, 0.5)',
    secondaryShadow: '0 1px 3px rgba(0, 0, 0, 0.18)',
  },
  light: {
    primary: 'rgba(0, 0, 0, 0.7)',
    primaryShadow: '0 1px 3px rgba(255, 255, 255, 0.25)',
    secondary: 'rgba(0, 0, 0, 0.5)',
    secondaryShadow: '0 1px 3px rgba(255, 255, 255, 0.18)',
  },
};

export const COLLAGE_TRACK_COLORS = {
  primary: 'var(--on)',
  secondary: 'var(--soft)',
} as const;

const gradientSurfaceSx: SxObject = {
  inset: 0,
  zIndex: -1,
};

const CARD_PAPER: CSSProperties & Record<`--${string}`, string> = {
  '--on': 'var(--dg-palette-text-primary)',
  '--pc': 'var(--dg-palette-background-paper)',
};

function AlbumSleeve({ track }: { track: Track }) {
  return (
    <AlbumArtWithNotes
      isPlaying={Boolean(track.isPlaying)}
      noteColor="var(--cream)"
      notesVariant="collage"
      wrapperSx={{
        aspectRatio: '1',
        overflow: 'visible',
        position: 'relative',
        width: 'min(100%, 300px)',
      }}
    >
      <div className="print__sleeve">
        <div className="print__sleevePiece">
          <a
            aria-label={track.album.name}
            className="print__artLink"
            href={track.album.externalUrls.spotify}
            rel="noreferrer"
            target="_blank"
            title={track.album.name}
          >
            <span className="print__art">
              <Image
                alt={track.album.name}
                cover={true}
                height={track.albumImage.height}
                quality={60}
                sizes={{ extraLarge: 300 }}
                url={track.albumImage.url}
                width={track.albumImage.width}
              />
            </span>
          </a>
        </div>
      </div>
    </AlbumArtWithNotes>
  );
}

export function CollageTrackCard({ track }: { track: Track }) {
  const gradient = track.albumGradient;
  const colors = track.albumGradientContrastSetting
    ? CONTRASTING_COLORS[track.albumGradientContrastSetting]
    : null;
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};

  return (
    <div className="home__spotify" data-slot="sp">
      <AlbumSleeve track={track} />
      <div className="home__spotifyCard">
        <AlbumGradientBackdrop containerSx={ALBUM_GRADIENT_GLOW_SX} gradient={gradient} />
        <PaperCard
          className="home__spotifyMeta"
          edge="quad-b"
          innerClassName="home__spotifyMetaPaper"
          style={CARD_PAPER}
        >
          <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
          <div className="home__spotifyMetaInner">
            <PlaybackStatus
              color={primary}
              isPlaying={track.isPlaying}
              listingVariant="card"
              playedAt={track.playedAt}
              service="Spotify"
              textShadow={primaryShadow}
            />
            <TrackTitle
              color={primary}
              listingVariant="card"
              textShadow={primaryShadow}
              trackTitle={track.name}
              url={track.externalUrls.spotify}
            />
            <ArtistList
              artists={track.artists}
              color={secondary}
              listingVariant="card"
              textShadow={secondaryShadow}
            />
            <PlaybackProgressBar
              color={primary}
              durationMs={track.durationMs}
              isPlaying={track.isPlaying}
              progressMs={track.progressMs}
            />
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
