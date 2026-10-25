'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { MusicNotes } from './MusicNotes';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { useWaveformBounce } from './useWaveformBounce';

const COMPACT_THUMBNAIL_SIZE = 44;
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

function AlbumArtWithNotes({
  bounceIntensity,
  children,
  isPlaying,
  noteColor,
  showNotes = true,
  variant,
}: {
  bounceIntensity?: number;
  children: ReactNode;
  isPlaying: boolean;
  noteColor?: string;
  showNotes?: boolean;
  variant: ListingVariant;
}) {
  const bounceRef = useWaveformBounce<HTMLDivElement>({ intensity: bounceIntensity, isPlaying });
  return (
    <div data-art-notes={variant}>
      {showNotes ? (
        <div aria-hidden="true" data-art-notes-center="">
          <MusicNotes isPlaying={isPlaying} noteColor={noteColor} />
        </div>
      ) : null}
      <div data-art-notes-bounce="" ref={bounceRef}>
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
  const titleVars = textShadow ? ({ '--track-shadow': textShadow } as CSSProperties) : undefined;
  const artistVars = secondaryShadow
    ? ({ '--track-shadow': secondaryShadow } as CSSProperties)
    : undefined;
  const fullArtists = track.artists
    .map((artist, index) => `${artist.name}${separator(index, track.artists.length) ?? ''}`)
    .join('');

  return (
    <>
      <Tooltip title={track.name} whenTruncated>
        {disableLinks ? (
          <Typography
            color={color}
            data-track-title=""
            data-variant={variant}
            style={titleVars}
            variant={titleVariant}
          >
            {track.name}
          </Typography>
        ) : (
          <Link
            color={color}
            data-track-title=""
            data-variant={variant}
            href={track.url}
            isExternal={true}
            style={titleVars}
            variant={titleVariant}
          >
            {track.name}
          </Link>
        )}
      </Tooltip>
      <Tooltip title={fullArtists} whenTruncated>
        <Typography
          color={secondaryColor}
          component="span"
          data-track-artists=""
          data-variant={variant}
          style={artistVars}
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
      <div data-album-art="">
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
      <div data-compact-track="">
        <div data-thumbnail-outer="">
          <AlbumArtWithNotes
            bounceIntensity={COLLAGE_COMPACT_BOUNCE}
            isPlaying={track.isPlaying ?? false}
            showNotes={false}
            variant="compact"
          >
            {disableLinks ? (
              <span data-compact-art-disabled="">{albumArtCard}</span>
            ) : (
              <Link href={track.album.url} isExternal={true} title={albumTitle}>
                {albumArtCard}
              </Link>
            )}
          </AlbumArtWithNotes>
        </div>
        <div data-compact-text="">
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
    );
  }

  const gradient = track.albumGradient;
  const colors = track.albumGradientContrastSetting
    ? CONTRASTING_COLORS[track.albumGradientContrastSetting]
    : null;
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};

  return (
    <div className="home__spotify" data-slot="sp">
      <AlbumArtWithNotes
        isPlaying={Boolean(track.isPlaying)}
        noteColor="var(--cream)"
        variant="card"
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
        <AlbumGradientBackdrop gradient={gradient} variant="glow" />
        <PaperCard
          className="home__spotifyMeta"
          edge="quad-b"
          innerClassName="home__spotifyMetaPaper"
          style={CARD_PAPER}
        >
          <AlbumGradientBackdrop gradient={gradient} variant="surface" />
          <div className="home__spotifyMetaInner">
            <PlaybackStatus
              color={primary}
              isPlaying={track.isPlaying}
              listingVariant="card"
              playedAt={track.playedAt}
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
