'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Card, Stack } from '@mui/material';
import { Leaf, Music, Music2, Music3, Music4 } from 'lucide-react';
import { useId } from 'react';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { ArtistList } from './ArtistList';
import type { Colors } from './colors';
import { MusicNotes } from './MusicNotes';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { type NowPlayingLayout, TrackTitle } from './TrackTitle';
import { WatercolorLeaves } from './WatercolorLeaves';

/**
 * Sage-to-gold fallback when album art has not produced a gradient yet.
 * Album colors still paint, then get mixed toward this wash.
 */
const FALLBACK_WASH = 'linear-gradient(155deg, #d8d4a0 0%, #c4b86a 46%, #9aa058 78%, #7a8a4a 100%)';

const CREAM: Colors = {
  primary: 'rgba(255, 248, 230, 0.96)',
  primaryContrast: 'rgba(48, 40, 16, 0.22)',
  primaryShadow: '0 1px 2px rgba(40, 28, 8, 0.16)',
  secondary: 'rgba(255, 244, 214, 0.78)',
  secondaryShadow: '0 1px 2px rgba(40, 28, 8, 0.1)',
};

const SAGE_GOLD_WASH =
  'radial-gradient(ellipse 110% 95% at 98% 0%, #e7d48a 0%, rgb(231 212 138 / 0.62) 28%, rgb(231 212 138 / 0.18) 58%, transparent 82%), linear-gradient(115deg, #7a8450 0%, #8f9456 22%, #b3ac64 48%, #d4c478 72%, #e7d48a 100%)';

const COPY_SCRIM =
  'radial-gradient(ellipse 95% 90% at 0% 100%, rgba(40, 55, 35, 0.55) 0%, rgba(40, 55, 35, 0.32) 24%, rgba(40, 55, 35, 0.14) 46%, rgba(40, 55, 35, 0.04) 62%, transparent 76%), linear-gradient(115deg, rgba(40, 55, 35, 0.4) 0%, rgba(40, 55, 35, 0.22) 18%, rgba(40, 55, 35, 0.1) 36%, rgba(40, 55, 35, 0.03) 52%, transparent 68%)';

const layerBaseSx: SxObject = {
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
};

const cardSx: SxObject = {
  '[data-greenhouse-frame] &': {
    backgroundColor: 'transparent',
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
  overflow: 'hidden',
  padding: 2.25,
  position: 'relative',
  width: '100%',
};

const washSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    backgroundImage: SAGE_GOLD_WASH,
    borderRadius: 'inherit',
    opacity: 0.9,
  },
  zIndex: 0,
};

const albumMixSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    borderRadius: 'inherit',
    filter: 'saturate(0.4) sepia(0.3) hue-rotate(12deg) brightness(1.06)',
    mixBlendMode: 'soft-light',
    opacity: 0.52,
  },
  zIndex: 1,
};

const hueLockSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    backgroundImage:
      'linear-gradient(115deg, rgb(88 104 48 / 0.28) 0%, rgb(180 168 88 / 0.22) 48%, rgb(231 212 138 / 0.38) 100%)',
    borderRadius: 'inherit',
    mixBlendMode: 'color',
    opacity: 0.4,
  },
  zIndex: 2,
};

const copyScrimSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    backgroundImage: COPY_SCRIM,
    borderRadius: 'inherit',
  },
  zIndex: 2,
};

const grainSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    mixBlendMode: 'soft-light',
    opacity: 0.085,
  },
  zIndex: 3,
};

const notesOriginSx: SxObject = {
  '[data-greenhouse-frame] &': {
    left: '54%',
    top: '22%',
  },
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 4,
};

const restingNotesSx: SxObject = {
  '[data-greenhouse-frame] &': {
    color: 'rgb(255 246 214 / 0.72)',
  },
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 4,
};

const layoutSx: SxObject = {
  flex: 1,
  gap: 1.25,
  justifyContent: 'flex-end',
  minHeight: 0,
  position: 'relative',
  zIndex: 5,
};

const copyRowSx: SxObject = {
  '@container now-playing (max-width: 13.5rem)': {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  '@container now-playing (min-width: 22.5rem)': {
    width: '56%',
  },
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'row',
  gap: 1.25,
  minWidth: 0,
  width: '92%',
};

const copyTextSx: SxObject = {
  flex: 1,
  minWidth: 0,
};

const artFrameSx: SxObject = {
  '@container now-playing (min-width: 22.5rem)': {
    height: 80,
    width: 80,
  },
  borderRadius: 1.5,
  boxShadow: '0 2px 10px rgb(32 28 12 / 0.22)',
  flexShrink: 0,
  height: 64,
  overflow: 'hidden',
  position: 'relative',
  width: 64,
};

const heroGridSx: SxObject = {
  '@container now-playing (max-width: 13.5rem)': {
    gridTemplateAreas: '"art" "copy" "progress"',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  '@container now-playing (min-width: 30rem)': {
    alignContent: 'stretch',
    alignItems: 'stretch',
    gap: 2,
    gridTemplateAreas: '"copy art" "progress art"',
    gridTemplateColumns: 'minmax(0, 1fr) 41%',
    gridTemplateRows: '1fr auto',
  },
  alignContent: 'end',
  display: 'grid',
  flex: 1,
  gap: 1.25,
  gridTemplateAreas: '"art copy" "progress progress"',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gridTemplateRows: 'auto auto',
  minHeight: 0,
  position: 'relative',
  zIndex: 5,
};

const heroCopySx: SxObject = {
  '@container now-playing (min-width: 30rem)': {
    alignSelf: 'start',
    paddingTop: 5.25,
  },
  gridArea: 'copy',
  minWidth: 0,
};

const heroArtLinkSx: SxObject = {
  '@container now-playing (min-width: 30rem)': {
    alignSelf: 'stretch',
    height: '100%',
    width: '100%',
  },
  alignSelf: 'end',
  display: 'block',
  gridArea: 'art',
  minHeight: 0,
  minWidth: 0,
};

const heroArtFrameSx: SxObject = {
  ...artFrameSx,
  '@container now-playing (min-width: 30rem)': {
    borderRadius: '18px',
    boxShadow: '0 8px 28px rgb(32 28 12 / 0.28)',
    height: '100%',
    width: '100%',
  },
};

const headerSx: SxObject = {
  alignItems: 'center',
  flexDirection: 'row',
  gap: 0.75,
};

const leafBadgeSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'rgb(255 248 236 / 0.94)',
  borderRadius: '999px',
  color: 'rgb(72 82 40 / 0.78)',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  left: 18,
  position: 'absolute',
  top: 18,
  width: 28,
  zIndex: 6,
};

const titleSx: SxObject = {
  '& .MuiTypography-root': {
    color: CREAM.primary,
    textShadow: CREAM.primaryShadow,
  },
  marginTop: 0.35,
  minWidth: 0,
};

const artistSx: SxObject = {
  '& .MuiTypography-root, & a': {
    color: CREAM.secondary,
    textShadow: CREAM.secondaryShadow,
  },
};

const progressWrapSx: SxObject = {
  '& > div': {
    backgroundColor: 'rgb(255 248 230 / 0.28) !important',
    height: '5px !important',
    marginTop: '0 !important',
  },
  '& > div > div': {
    backgroundColor: 'rgb(255 248 228 / 0.96) !important',
  },
  marginTop: 0.25,
};

const heroProgressSx: SxObject = {
  ...progressWrapSx,
  gridArea: 'progress',
  minWidth: 0,
};

const RESTING_NOTES = [
  { Icon: Music, left: '52%', rotate: '-18deg', size: 16, top: '8%' },
  { Icon: Music2, left: '64%', rotate: '14deg', size: 28, top: '14%' },
  { Icon: Music3, left: '78%', rotate: '-10deg', size: 36, top: '6%' },
  { Icon: Music4, left: '58%', rotate: '20deg', size: 18, top: '28%' },
  { Icon: Music, left: '86%', rotate: '8deg', size: 22, top: '24%' },
  { Icon: Music2, left: '70%', rotate: '-22deg', size: 14, top: '34%' },
  { Icon: Music4, left: '48%', rotate: '6deg', size: 20, top: '16%' },
  { Icon: Music3, left: '90%', rotate: '-6deg', size: 30, top: '38%' },
] as const;

const ART_SOURCE_PX = 160;
const HERO_ART_SOURCE_PX = 800;

function AlbumThumb({ layout, track }: { layout: NowPlayingLayout; track: Track }) {
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const hero = layout === 'hero';
  const sourcePx = hero ? HERO_ART_SOURCE_PX : ART_SOURCE_PX;

  return (
    <Link
      href={albumUrl}
      isExternal={true}
      sx={hero ? heroArtLinkSx : undefined}
      title={albumTitle}
    >
      <Card data-now-playing-art="" sx={hero ? heroArtFrameSx : artFrameSx}>
        <Image
          alt={albumTitle}
          fill={true}
          height={sourcePx}
          sizes={
            hero
              ? { extraLarge: HERO_ART_SOURCE_PX, large: 640, tiny: 256 }
              : { extraLarge: ART_SOURCE_PX, tiny: 128 }
          }
          url={track.albumImage.url}
          width={sourcePx}
        />
      </Card>
    </Link>
  );
}

function RestingNotes() {
  return (
    <Box aria-hidden="true" data-resting-notes="" sx={restingNotesSx}>
      {RESTING_NOTES.map(({ Icon, left, rotate, size, top }) => (
        <Box
          key={`${left}-${top}`}
          sx={{ left, position: 'absolute', top, transform: `rotate(${rotate})` }}
        >
          <Icon size={size} strokeWidth={2.25} />
        </Box>
      ))}
    </Box>
  );
}

function FrostGrain() {
  const rawId = useId();
  const id = `${rawId.replaceAll(':', '')}-grain`;

  return (
    <Box aria-hidden="true" data-now-playing-grain="" sx={grainSx}>
      <svg aria-hidden="true" height="100%" preserveAspectRatio="none" width="100%">
        <filter id={id}>
          <feTurbulence baseFrequency="0.85" numOctaves="4" type="fractalNoise" />
        </filter>
        <rect filter={`url(#${id})`} height="100%" width="100%" />
      </svg>
    </Box>
  );
}

function NowPlayingCopy({ layout, track }: { layout: NowPlayingLayout; track: Track }) {
  return (
    <>
      <Stack sx={headerSx}>
        <PlaybackStatus
          color={CREAM.primary}
          isPlaying={track.isPlaying}
          listingVariant="card"
          playedAt={track.playedAt}
          textShadow={CREAM.primaryShadow}
        />
      </Stack>
      <Box data-now-playing-title="" sx={titleSx}>
        <TrackTitle
          color={CREAM.primary}
          layout={layout}
          listingVariant="nowPlaying"
          textShadow={CREAM.primaryShadow}
          trackTitle={track.name}
          url={track.externalUrls.spotify}
        />
      </Box>
      <Box data-now-playing-artist="" sx={artistSx}>
        <ArtistList
          artists={track.artists}
          color={CREAM.secondary}
          listingVariant="nowPlaying"
          textShadow={CREAM.secondaryShadow}
        />
      </Box>
    </>
  );
}

function NowPlayingProgress({ track }: { track: Track }) {
  return (
    <PlaybackProgressBar
      colors={CREAM}
      durationMs={track.durationMs}
      isPlaying={track.isPlaying}
      progressMs={track.progressMs}
    />
  );
}

/**
 * Greenhouse now-playing tile: sage/gold wash, watercolor leaves, floating
 * notes, and a cream progress pill. Live `Track` pieces stay underneath.
 * `layout="hero"` is the landscape music-page card; it falls back to the
 * cell arrangement below 30rem. Default `cell` stays the homepage tile.
 */
export function NowPlayingCard({
  layout = 'cell',
  track,
}: {
  layout?: NowPlayingLayout;
  track: Track;
}) {
  const gradient = track.albumGradient ?? FALLBACK_WASH;
  const hero = layout === 'hero';

  return (
    <ContentCard data-bento="now-playing" data-now-playing-layout={layout} sx={cardSx}>
      <Box aria-hidden="true" data-now-playing-wash="" sx={washSx} />
      <Box aria-hidden="true" sx={albumMixSx}>
        <AlbumGradientBackdrop containerSx={{ inset: 0 }} gradient={gradient} />
      </Box>
      <Box aria-hidden="true" sx={hueLockSx} />
      <Box aria-hidden="true" data-now-playing-scrim="" sx={copyScrimSx} />
      <FrostGrain />
      <WatercolorLeaves />
      <RestingNotes />
      <Box aria-hidden="true" sx={notesOriginSx}>
        <MusicNotes isPlaying={Boolean(track.isPlaying)} noteColor={CREAM.primary} variant="card" />
      </Box>
      <Box aria-hidden="true" data-now-playing-leaf="" sx={leafBadgeSx}>
        <Leaf size={14} />
      </Box>
      {hero ? (
        <Box data-now-playing-hero="" sx={heroGridSx}>
          <AlbumThumb layout="hero" track={track} />
          <Stack data-now-playing-copy="" sx={heroCopySx}>
            <NowPlayingCopy layout="hero" track={track} />
          </Stack>
          <Box data-now-playing-progress="" sx={heroProgressSx}>
            <NowPlayingProgress track={track} />
          </Box>
        </Box>
      ) : (
        <Stack sx={layoutSx}>
          <Box data-now-playing-copy="" sx={copyRowSx}>
            <AlbumThumb layout="cell" track={track} />
            <Stack sx={copyTextSx}>
              <NowPlayingCopy layout="cell" track={track} />
            </Stack>
          </Box>
          <Box data-now-playing-progress="" sx={progressWrapSx}>
            <NowPlayingProgress track={track} />
          </Box>
        </Stack>
      )}
    </ContentCard>
  );
}
