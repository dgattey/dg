'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Card, Stack } from '@mui/material';
import {
  ALBUM_ART_BORDER_RADIUS,
  ALBUM_ART_HOVER_SCALE,
  albumArtHoverTransitionSx,
} from '../albumArtStyles';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { ArtistList } from './ArtistList';
import { getContrastingColors } from './colors';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { SpotifyLogo } from './SpotifyLogo';
import { type NowPlayingLayout, TrackTitle } from './TrackTitle';

const shellSx: SxObject = {
  height: '100%',
  overflow: 'visible',
  position: 'relative',
};

const glowSx: SxObject = {
  borderRadius: 6,
  filter: 'blur(16px)',
  inset: -2,
  opacity: 0.45,
  zIndex: 0,
};

const cardSx: SxObject = {
  '[data-greenhouse-frame] &': {
    backdropFilter: 'var(--card-backdrop-filter)',
    background: 'var(--card-bg)',
    boxShadow: 'var(--card-box-shadow)',
  },
  boxSizing: 'border-box',
  containerName: 'now-playing',
  containerType: 'inline-size',
  display: 'flex',
  height: '100%',
  maxWidth: 'none',
  minHeight: { md: '15rem', xs: '16.5rem' },
  minWidth: 0,
  overflow: 'visible',
  padding: 2.5,
  position: 'relative',
  width: '100%',
  zIndex: 1,
};

const heroCardSx: SxObject = {
  ...cardSx,
  padding: 0,
};

const gradientSurfaceSx: SxObject = {
  '[data-greenhouse-frame] &': {
    opacity: 0.84,
  },
  borderRadius: 'inherit',
  inset: '-1px',
  zIndex: 0,
};

const layoutSx: SxObject = {
  flex: 1,
  gap: 1,
  justifyContent: 'space-between',
  minHeight: 0,
  minWidth: 0,
  position: 'relative',
  zIndex: 1,
};

const headerSx: SxObject = {
  alignItems: 'flex-start',
  gap: 1.5,
  justifyContent: 'space-between',
};

const copySx: SxObject = {
  alignItems: 'flex-start',
  minWidth: 0,
  textAlign: 'left',
};

const titleSx: SxObject = {
  marginTop: 0.25,
  minWidth: 0,
};

const cellArtWrapSx: SxObject = {
  '--image-dim': 'min(14rem, 56cqi, calc(100cqi - 4.5rem))',
  '@container now-playing (max-width: 210px)': {
    '--image-dim': '100%',
    marginLeft: 0,
    width: '100%',
  },
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  flexShrink: 0,
  marginLeft: 'auto',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  width: 'var(--image-dim)',
};

const artLinkSx: SxObject = {
  '&:focus-visible, &:hover': { transform: `scale(${ALBUM_ART_HOVER_SCALE})` },
  display: 'block',
  ...albumArtHoverTransitionSx,
};

const artCardSx: SxObject = {
  ...ALBUM_ART_BORDER_RADIUS,
  aspectRatio: '1 / 1',
  height: '100%',
  margin: 0,
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
  padding: 0,
  position: 'relative',
  width: '100%',
};

const heroArtWrapSx: SxObject = {
  '@container now-playing (max-width: 480px)': {
    aspectRatio: '1 / 1',
    flex: '0 0 auto',
    height: 'auto',
    maxWidth: 'min(72cqi, 16rem)',
    padding: 0,
    width: 'min(72cqi, 16rem)',
  },
  alignItems: 'center',
  alignSelf: 'stretch',
  boxSizing: 'border-box',
  display: 'flex',
  flex: '0 0 40%',
  justifyContent: 'center',
  maxWidth: '40%',
  minHeight: 0,
  minWidth: 0,
  overflow: 'visible',
  padding: 1.5,
  position: 'relative',
  width: '40%',
};

const heroArtFillSx: SxObject = {
  aspectRatio: '1 / 1',
  flex: '1 1 auto',
  maxHeight: '100%',
  maxWidth: '100%',
  overflow: 'visible',
  width: '100%',
};

const artNotesWrapSx: SxObject = {
  height: '100%',
  minHeight: 0,
  overflow: 'visible',
  width: '100%',
};

const heroGridSx: SxObject = {
  '@container now-playing (max-width: 480px)': {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 1,
    padding: 2.5,
  },
  alignItems: 'stretch',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  gap: 0,
  height: '100%',
  minHeight: { sm: '14rem', xs: '16.5rem' },
  minWidth: 0,
  padding: 0,
  position: 'relative',
  width: '100%',
  zIndex: 1,
};

const heroArtLinkSx: SxObject = {
  ...artLinkSx,
  display: 'block',
  height: '100%',
  width: '100%',
};

const heroArtFrameSx: SxObject = {
  ...ALBUM_ART_BORDER_RADIUS,
  '@container now-playing (max-width: 480px)': {
    aspectRatio: '1 / 1',
  },
  '@container now-playing (min-width: 480px)': {
    borderRadius: 3,
  },
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const heroCopySx: SxObject = {
  '@container now-playing (min-width: 480px)': {
    justifyContent: 'space-between',
    paddingBottom: 2.5,
    paddingLeft: 1,
    paddingRight: 2.5,
    paddingTop: 2.5,
  },
  display: 'flex',
  flex: '1 1 60%',
  flexDirection: 'column',
  gap: 1,
  justifyContent: 'flex-end',
  minWidth: 0,
};

const logoSlotSx: SxObject = {
  flexShrink: 0,
};

const reducedMotionSx: SxObject = {
  '@media (prefers-reduced-motion: reduce)': {
    '& [data-music-notes]': {
      display: 'none',
    },
  },
};

const CELL_ART_SOURCE_PX = 448;
const HERO_ART_SOURCE_PX = 800;

function AlbumCover({
  isPlaying,
  layout,
  noteColor,
  track,
}: {
  isPlaying: boolean;
  layout: NowPlayingLayout;
  noteColor?: string;
  track: Track;
}) {
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const hero = layout === 'hero';
  const sourcePx = hero ? HERO_ART_SOURCE_PX : CELL_ART_SOURCE_PX;

  const cover = (
    <AlbumArtWithNotes isPlaying={isPlaying} noteColor={noteColor} wrapperSx={artNotesWrapSx}>
      <Link
        href={albumUrl}
        isExternal={true}
        sx={hero ? heroArtLinkSx : artLinkSx}
        title={albumTitle}
      >
        <Card sx={hero ? heroArtFrameSx : artCardSx}>
          <Image
            alt={albumTitle}
            fill={true}
            height={sourcePx}
            sizes={
              hero
                ? { extraLarge: HERO_ART_SOURCE_PX, large: 640, tiny: 256 }
                : { extraLarge: CELL_ART_SOURCE_PX, tiny: 224 }
            }
            url={track.albumImage.url}
            width={sourcePx}
          />
        </Card>
      </Link>
    </AlbumArtWithNotes>
  );

  return (
    <Box data-now-playing-art="" sx={hero ? heroArtWrapSx : cellArtWrapSx}>
      {hero ? (
        <Box data-hero-art-fill="" sx={heroArtFillSx}>
          {cover}
        </Box>
      ) : (
        cover
      )}
    </Box>
  );
}

function NowPlayingCopy({
  colors,
  layout,
  track,
}: {
  colors: ReturnType<typeof getContrastingColors>;
  layout: NowPlayingLayout;
  track: Track;
}) {
  const { primary, secondary, primaryShadow, secondaryShadow } = colors ?? {};
  return (
    <Stack data-now-playing-copy="" sx={copySx}>
      <PlaybackStatus
        color={primary}
        isPlaying={track.isPlaying}
        listingVariant="card"
        playedAt={track.playedAt}
        textShadow={primaryShadow}
      />
      <Box data-now-playing-title="" sx={titleSx}>
        <TrackTitle
          color={primary}
          layout={layout}
          listingVariant="nowPlaying"
          textShadow={primaryShadow}
          trackTitle={track.name}
          url={track.externalUrls.spotify}
        />
      </Box>
      <Box data-now-playing-artist="">
        <ArtistList
          artists={track.artists}
          color={secondary}
          listingVariant="nowPlaying"
          textShadow={secondaryShadow}
        />
      </Box>
    </Stack>
  );
}

/**
 * Greenhouse now-playing tile. Same pieces as the flag-off card: Spotify
 * logo, large album art with floating notes, status, title, artist, and a
 * progress pill, painted on the glass card with the album gradient.
 * `layout="hero"` is the landscape music-page card and falls back to the
 * cell arrangement below 480px.
 */
export function NowPlayingCard({
  layout = 'cell',
  track,
}: {
  layout?: NowPlayingLayout;
  track: Track;
}) {
  const colors = getContrastingColors(track);
  const { primary, primaryShadow } = colors ?? {};
  const isPlaying = Boolean(track.isPlaying);
  const hero = layout === 'hero';
  const gradient = track.albumGradient;

  return (
    <Box
      data-now-playing-fallback={gradient ? undefined : ''}
      sx={{ ...shellSx, ...reducedMotionSx }}
    >
      {gradient ? <AlbumGradientBackdrop containerSx={glowSx} gradient={gradient} /> : null}
      <ContentCard
        data-bento="now-playing"
        data-now-playing-layout={layout}
        sx={hero ? heroCardSx : cardSx}
      >
        {gradient ? (
          <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
        ) : null}
        {hero ? (
          <Box data-now-playing-hero="" sx={heroGridSx}>
            <AlbumCover isPlaying={isPlaying} layout="hero" noteColor={primary} track={track} />
            <Stack sx={heroCopySx}>
              <Box data-now-playing-logo="" sx={logoSlotSx}>
                <SpotifyLogo
                  color={primary}
                  textShadow={primaryShadow}
                  trackTitle={track.name}
                  url={track.externalUrls.spotify}
                />
              </Box>
              <Stack sx={{ minWidth: 0 }}>
                <NowPlayingCopy colors={colors} layout="hero" track={track} />
                <Box data-now-playing-progress="">
                  <PlaybackProgressBar
                    colors={colors}
                    durationMs={track.durationMs}
                    isPlaying={track.isPlaying}
                    progressMs={track.progressMs}
                  />
                </Box>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Stack sx={layoutSx}>
            <Stack direction="row" sx={headerSx}>
              <Box data-now-playing-logo="" sx={logoSlotSx}>
                <SpotifyLogo
                  color={primary}
                  textShadow={primaryShadow}
                  trackTitle={track.name}
                  url={track.externalUrls.spotify}
                />
              </Box>
              <AlbumCover isPlaying={isPlaying} layout="cell" noteColor={primary} track={track} />
            </Stack>
            <Stack sx={{ minWidth: 0 }}>
              <NowPlayingCopy colors={colors} layout="cell" track={track} />
              <Box data-now-playing-progress="">
                <PlaybackProgressBar
                  colors={colors}
                  durationMs={track.durationMs}
                  isPlaying={track.isPlaying}
                  progressMs={track.progressMs}
                />
              </Box>
            </Stack>
          </Stack>
        )}
      </ContentCard>
    </Box>
  );
}
