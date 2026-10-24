'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCE, TIMING_SLOW } from '@dg/ui/helpers/timing';
import { type ComponentProps, type CSSProperties, Fragment, type ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { ALBUM_GRADIENT_GLOW_STYLE, AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { MusicNotes } from './MusicNotes';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { useWaveformBounce } from './useWaveformBounce';

const COMPACT_THUMBNAIL_SIZE = 44;
const COMPACT_HOVER_SIZE = 84;
const COLLAGE_COMPACT_BOUNCE = 3;

type ListingVariant = 'card' | 'compact';

const CONTRASTING_COLORS = {
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
} as const;

const TRACK_LISTING_CSS = `
[data-track-artists] a {
  color: inherit;
}
:focus-visible [data-compact-track] [data-album-art],
[data-compact-track]:has(:focus-visible) [data-album-art] {
  box-shadow: var(--dg-shadow-card-hovered);
  transform: scale(${COMPACT_HOVER_SIZE / COMPACT_THUMBNAIL_SIZE});
  z-index: 1;
}
:focus-visible [data-compact-track] [data-thumbnail-outer],
[data-compact-track]:has(:focus-visible) [data-thumbnail-outer] {
  width: ${COMPACT_HOVER_SIZE}px !important;
}
@media (hover: hover) {
  [data-compact-track]:hover [data-album-art] {
    box-shadow: var(--dg-shadow-card-hovered);
    transform: scale(${COMPACT_HOVER_SIZE / COMPACT_THUMBNAIL_SIZE});
    z-index: 1;
  }
  [data-compact-track]:hover [data-thumbnail-outer] {
    width: ${COMPACT_HOVER_SIZE}px !important;
  }
}
`;

const truncatedStyle: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const notesCenterStyle: CSSProperties = {
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 0,
};

const bounceBoxStyle: CSSProperties = {
  backfaceVisibility: 'hidden',
  height: '100%',
  overflow: 'visible',
  position: 'relative',
  width: '100%',
  zIndex: 2,
};

function AlbumArtWithNotes({
  bounceIntensity,
  children,
  isPlaying,
  noteColor,
  notesVariant = 'collage',
  wrapperStyle,
}: {
  bounceIntensity?: number;
  children: ReactNode;
  isPlaying: boolean;
  noteColor?: string;
  notesVariant?: ComponentProps<typeof MusicNotes>['variant'];
  wrapperStyle: CSSProperties;
}) {
  const bounceRef = useWaveformBounce<HTMLDivElement>({ intensity: bounceIntensity, isPlaying });
  return (
    <div
      style={{ isolation: 'isolate', overflow: 'visible', position: 'relative', ...wrapperStyle }}
    >
      <div aria-hidden="true" style={notesCenterStyle}>
        <MusicNotes isPlaying={isPlaying} noteColor={noteColor} variant={notesVariant} />
      </div>
      <div ref={bounceRef} style={bounceBoxStyle}>
        {children}
      </div>
    </div>
  );
}

function separator(index: number, length: number): string | null {
  if (index === length - 1) return null;
  if (length === 2) return ' & ';
  return index < length - 2 ? ', ' : ', & ';
}

function TrackMeta({
  color,
  disableLinks,
  secondaryColor,
  secondaryShadow,
  textShadow,
  track,
  variant,
}: {
  color?: string;
  disableLinks?: boolean;
  secondaryColor?: string;
  secondaryShadow?: string;
  textShadow?: string;
  track: Track;
  variant: ListingVariant;
}) {
  const isCard = variant === 'card';
  const titleVariant = isCard ? 'h5' : 'caption';
  const artistVariant = isCard ? 'body2' : 'caption';
  const titleStyle: CSSProperties = {
    ...truncatedStyle,
    ...(isCard ? { marginBottom: 8 } : { lineHeight: 1.2 }),
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
  };
  const artistStyle: CSSProperties = {
    ...truncatedStyle,
    ...(isCard ? {} : { lineHeight: 1.2, opacity: 0.6 }),
    ...(secondaryColor ? { color: secondaryColor, opacity: 1 } : {}),
    ...(secondaryShadow ? { textShadow: secondaryShadow } : {}),
  };
  const fullArtists = track.artists
    .map((artist, index) => `${artist.name}${separator(index, track.artists.length) ?? ''}`)
    .join('');

  return (
    <>
      <Tooltip title={track.name} whenTruncated>
        {disableLinks ? (
          <Typography style={titleStyle} variant={titleVariant}>
            {track.name}
          </Typography>
        ) : (
          <Link href={track.url} isExternal={true} style={titleStyle} variant={titleVariant}>
            {track.name}
          </Link>
        )}
      </Tooltip>
      <Tooltip title={fullArtists} whenTruncated>
        <Typography
          component="span"
          data-track-artists=""
          style={artistStyle}
          variant={artistVariant}
        >
          {track.artists.map((artist, index) => (
            <Fragment key={artist.id}>
              {isCard ? (
                <Link
                  href={artist.url}
                  isExternal={true}
                  title={artist.name}
                  variant={artistVariant}
                >
                  {artist.name}
                </Link>
              ) : (
                artist.name
              )}
              <span>{separator(index, track.artists.length)}</span>
            </Fragment>
          ))}
        </Typography>
      </Tooltip>
    </>
  );
}

const compactOuterStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 8,
  minWidth: 0,
  overflow: 'visible',
};

const compactThumbWrapStyle: CSSProperties = {
  flexShrink: 0,
  height: COMPACT_THUMBNAIL_SIZE,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  transition: createTransition('width', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
};

const compactArtCardStyle: CSSProperties = {
  borderRadius: 'var(--nested-radius)',
  boxShadow: 'var(--dg-shadow-card-main)',
  height: COMPACT_THUMBNAIL_SIZE,
  overflow: 'hidden',
  position: 'relative',
  transformOrigin: 'left center',
  transition: createTransition('transform', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
  willChange: 'transform',
};

const compactTextClipStyle: CSSProperties = {
  flexShrink: 1,
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  width: 'fit-content',
};

const CARD_PAPER: CSSProperties & Record<`--${string}`, string> = {
  '--on': 'var(--dg-palette-text-primary)',
  '--pc': 'var(--dg-palette-background-paper)',
};

export function TrackListing({
  track,
  variant = 'card',
  disableLinks,
}: {
  track: Track;
  variant?: ListingVariant;
  disableLinks?: boolean;
}) {
  if (variant === 'compact') {
    const albumTitle = track.album.name;
    const albumArtCard = (
      <div data-album-art style={compactArtCardStyle}>
        <Image
          alt={albumTitle}
          fill={true}
          height={COMPACT_THUMBNAIL_SIZE}
          sizes={{ extraLarge: COMPACT_THUMBNAIL_SIZE }}
          url={track.albumImage.url}
          width={COMPACT_THUMBNAIL_SIZE}
        />
      </div>
    );

    return (
      <div data-compact-track="" style={compactOuterStyle}>
        <style href="dg-track-listing" precedence="default">
          {TRACK_LISTING_CSS}
        </style>
        <div data-thumbnail-outer style={compactThumbWrapStyle}>
          <AlbumArtWithNotes
            bounceIntensity={COLLAGE_COMPACT_BOUNCE}
            isPlaying={track.isPlaying ?? false}
            noteColor="var(--ink)"
            notesVariant="collageCompact"
            wrapperStyle={{ height: COMPACT_THUMBNAIL_SIZE, width: COMPACT_THUMBNAIL_SIZE }}
          >
            {disableLinks ? (
              <span style={{ display: 'block' }}>{albumArtCard}</span>
            ) : (
              <Link href={track.album.url} isExternal={true} title={albumTitle}>
                {albumArtCard}
              </Link>
            )}
          </AlbumArtWithNotes>
        </div>
        <div style={compactTextClipStyle}>
          <div
            style={{
              color: 'var(--on)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              width: '100%',
            }}
          >
            <PlaybackStatus
              color="var(--on)"
              isPlaying={track.isPlaying}
              listingVariant="compact"
              playedAt={track.playedAt}
            />
            <TrackMeta
              color="var(--on)"
              disableLinks={disableLinks}
              secondaryColor="var(--soft)"
              track={track}
              variant="compact"
            />
          </div>
        </div>
      </div>
    );
  }

  const gradient = track.albumGradient;
  const colors = track.albumGradientContrastSetting
    ? CONTRASTING_COLORS[track.albumGradientContrastSetting]
    : null;
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};

  return (
    <div className="home__spotify" data-slot="sp">
      <style href="dg-track-listing" precedence="default">
        {TRACK_LISTING_CSS}
      </style>
      <AlbumArtWithNotes
        isPlaying={Boolean(track.isPlaying)}
        noteColor="var(--cream)"
        notesVariant="collage"
        wrapperStyle={{
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
              href={track.album.url}
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
      <div className="home__spotifyCard">
        <AlbumGradientBackdrop containerStyle={ALBUM_GRADIENT_GLOW_STYLE} gradient={gradient} />
        <PaperCard
          className="home__spotifyMeta"
          edge="quad-b"
          innerClassName="home__spotifyMetaPaper"
          style={CARD_PAPER}
        >
          <AlbumGradientBackdrop containerStyle={{ inset: 0, zIndex: -1 }} gradient={gradient} />
          <div className="home__spotifyMetaInner">
            <PlaybackStatus
              color={primary}
              isPlaying={track.isPlaying}
              listingVariant="card"
              playedAt={track.playedAt}
              service="Spotify"
              textShadow={primaryShadow}
            />
            <TrackMeta
              color={primary}
              secondaryColor={secondary}
              secondaryShadow={secondaryShadow}
              textShadow={primaryShadow}
              track={track}
              variant="card"
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
