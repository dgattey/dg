'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import { Stack } from '@dg/ui/core/Stack';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_BOUNCE, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { type ComponentProps, type CSSProperties, Fragment, type ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { ALBUM_GRADIENT_GLOW_SX, AlbumGradientBackdrop } from './AlbumGradientBackdrop';
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

const truncatedSx: SxObject = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const notesCenterSx: SxObject = {
  left: '50%',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 0,
};

const bounceBoxSx: SxObject = {
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
  wrapperSx,
}: {
  bounceIntensity?: number;
  children: ReactNode;
  isPlaying: boolean;
  noteColor?: string;
  notesVariant?: ComponentProps<typeof MusicNotes>['variant'];
  wrapperSx: SxObject;
}) {
  const bounceRef = useWaveformBounce<HTMLDivElement>({ intensity: bounceIntensity, isPlaying });
  return (
    <Box sx={{ isolation: 'isolate', overflow: 'visible', position: 'relative', ...wrapperSx }}>
      <Box aria-hidden="true" sx={notesCenterSx}>
        <MusicNotes isPlaying={isPlaying} noteColor={noteColor} variant={notesVariant} />
      </Box>
      <Box ref={bounceRef} sx={bounceBoxSx}>
        {children}
      </Box>
    </Box>
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
  const titleSx: SxObject = {
    ...truncatedSx,
    ...(isCard ? { marginBottom: 1 } : { lineHeight: 1.2 }),
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
  };
  const artistSx: SxObject = {
    ...truncatedSx,
    ...(isCard ? {} : { lineHeight: 1.2, opacity: 0.6 }),
    ...(secondaryColor ? { '& a': { color: 'inherit' }, color: secondaryColor, opacity: 1 } : {}),
    ...(secondaryShadow ? { textShadow: secondaryShadow } : {}),
  };
  const fullArtists = track.artists
    .map((artist, index) => `${artist.name}${separator(index, track.artists.length) ?? ''}`)
    .join('');

  return (
    <>
      <Tooltip title={track.name} whenTruncated>
        {disableLinks ? (
          <Typography sx={titleSx} variant={titleVariant}>
            {track.name}
          </Typography>
        ) : (
          <Link href={track.url} isExternal={true} sx={titleSx} variant={titleVariant}>
            {track.name}
          </Link>
        )}
      </Tooltip>
      <Tooltip title={fullArtists} whenTruncated>
        <Typography component="span" sx={artistSx} variant={artistVariant}>
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

const compactZoomSx: SxObject = {
  '[data-album-art]': {
    boxShadow: 'var(--dg-shadow-card-hovered)',
    transform: `scale(${COMPACT_HOVER_SIZE / COMPACT_THUMBNAIL_SIZE})`,
    zIndex: 1,
  },
  '[data-thumbnail-outer]': { width: COMPACT_HOVER_SIZE },
};

const compactOuterSx: SxObject = {
  ':focus-visible &, &:has(:focus-visible)': compactZoomSx,
  '@media (hover: hover)': { '&:hover': compactZoomSx },
  alignItems: 'center',
  display: 'flex',
  gap: 1,
  minWidth: 0,
  overflow: 'visible',
};

const compactThumbWrapSx: SxObject = {
  flexShrink: 0,
  height: COMPACT_THUMBNAIL_SIZE,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  transition: createTransition('width', TIMING_SLOW, EASING_BOUNCE),
  width: COMPACT_THUMBNAIL_SIZE,
};

const compactArtCardSx: SxObject = {
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

const compactTextClipSx: SxObject = {
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
      <Box data-album-art sx={compactArtCardSx}>
        <Image
          alt={albumTitle}
          fill={true}
          height={COMPACT_THUMBNAIL_SIZE}
          sizes={{ extraLarge: COMPACT_THUMBNAIL_SIZE }}
          url={track.albumImage.url}
          width={COMPACT_THUMBNAIL_SIZE}
        />
      </Box>
    );

    return (
      <Box sx={compactOuterSx}>
        <Box data-thumbnail-outer sx={compactThumbWrapSx}>
          <AlbumArtWithNotes
            bounceIntensity={COLLAGE_COMPACT_BOUNCE}
            isPlaying={track.isPlaying ?? false}
            noteColor="var(--ink)"
            notesVariant="collageCompact"
            wrapperSx={{ height: COMPACT_THUMBNAIL_SIZE, width: COMPACT_THUMBNAIL_SIZE }}
          >
            {disableLinks ? (
              <Box component="span" sx={{ display: 'block' }}>
                {albumArtCard}
              </Box>
            ) : (
              <Link href={track.album.url} isExternal={true} title={albumTitle}>
                {albumArtCard}
              </Link>
            )}
          </AlbumArtWithNotes>
        </Box>
        <Box sx={compactTextClipSx}>
          <Stack sx={{ color: 'var(--on)', minWidth: 0, width: '100%' }}>
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
          </Stack>
        </Box>
      </Box>
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
        <AlbumGradientBackdrop containerSx={ALBUM_GRADIENT_GLOW_SX} gradient={gradient} />
        <PaperCard
          className="home__spotifyMeta"
          edge="quad-b"
          innerClassName="home__spotifyMetaPaper"
          style={CARD_PAPER}
        >
          <AlbumGradientBackdrop containerSx={{ inset: 0, zIndex: -1 }} gradient={gradient} />
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
