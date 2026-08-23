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
  isolation: 'isolate',
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
    backgroundColor: 'var(--card-bg, var(--glass-bg))',
  },
  boxSizing: 'border-box',
  containerName: 'now-playing',
  containerType: 'inline-size',
  display: 'flex',
  height: '100%',
  isolation: 'isolate',
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
  zIndex: -1,
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
  '@container now-playing (max-width: 16.5rem)': {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 1.5,
  },
  gap: 3,
  justifyContent: 'space-between',
};

const copySx: SxObject = {
  minWidth: 0,
};

const titleSx: SxObject = {
  marginTop: 0.25,
  minWidth: 0,
};

const cellArtWrapSx: SxObject = {
  '--image-dim': 'clamp(9.375rem, 56cqi, 14rem)',
  '@container now-playing (max-width: 16.5rem)': {
    '--image-dim': 'min(72cqi, 12rem)',
    alignSelf: 'flex-start',
  },
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  minWidth: 'var(--image-dim)',
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
  '@container now-playing (max-width: 30rem)': {
    height: 'auto',
    margin: 0,
    width: 'min(72cqi, 12rem)',
  },
  alignSelf: 'stretch',
  gridArea: 'art',
  height: 'calc(100% - 24px)',
  justifySelf: 'stretch',
  margin: '12px',
  minHeight: 0,
  minWidth: 0,
  overflow: 'visible',
  position: 'relative',
  width: 'auto',
};

const artNotesWrapSx: SxObject = {
  height: '100%',
  overflow: 'visible',
  width: '100%',
};

const heroGridSx: SxObject = {
  '@container now-playing (max-width: 30rem)': {
    gap: 1,
    gridTemplateAreas: '"logo" "art" "copy"',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto auto 1fr',
    padding: 2.5,
  },
  display: 'grid',
  flex: 1,
  gap: 0,
  gridTemplateAreas: '"art copy"',
  gridTemplateColumns: 'minmax(0, 4fr) minmax(0, 6fr)',
  gridTemplateRows: 'minmax(0, 1fr)',
  height: '100%',
  minHeight: 0,
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
  '@container now-playing (max-width: 30rem)': {
    aspectRatio: '1 / 1',
  },
  '@container now-playing (min-width: 30rem)': {
    borderRadius: 3,
  },
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const heroCopySx: SxObject = {
  '@container now-playing (min-width: 30rem)': {
    justifyContent: 'space-between',
    paddingBottom: 2.5,
    paddingLeft: 1,
    paddingRight: 2.5,
    paddingTop: 2.5,
  },
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  gridArea: 'copy',
  justifyContent: 'flex-end',
  minWidth: 0,
};

const heroLogoSx: SxObject = {
  '@container now-playing (min-width: 30rem)': {
    gridArea: 'unset',
  },
  gridArea: 'logo',
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

  return (
    <Box data-now-playing-art="" sx={hero ? heroArtWrapSx : cellArtWrapSx}>
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
 * cell arrangement below 30rem.
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

  return (
    <Box sx={{ ...shellSx, ...reducedMotionSx }}>
      <AlbumGradientBackdrop containerSx={glowSx} gradient={track.albumGradient} />
      <ContentCard
        data-bento="now-playing"
        data-now-playing-layout={layout}
        sx={hero ? heroCardSx : cardSx}
      >
        <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={track.albumGradient} />
        {hero ? (
          <Box data-now-playing-hero="" sx={heroGridSx}>
            <AlbumCover isPlaying={isPlaying} layout="hero" noteColor={primary} track={track} />
            <Stack sx={heroCopySx}>
              <Box data-now-playing-logo="" sx={heroLogoSx}>
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
              <Box data-now-playing-logo="">
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
