'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { Leaf, Music, Music2, Music3, Music4 } from 'lucide-react';
import { useId } from 'react';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { ArtistList } from './ArtistList';
import type { Colors } from './colors';
import { MusicNotes } from './MusicNotes';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';
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
  'radial-gradient(ellipse 90% 80% at 96% 4%, #e7d48a 0%, rgb(231 212 138 / 0.55) 36%, transparent 78%), linear-gradient(115deg, #6a7548 0%, #9aa05a 38%, #c9b86a 68%, #e7d48a 100%)';

const COPY_SCRIM =
  'radial-gradient(ellipse 78% 82% at 6% 96%, rgba(40, 55, 35, 0.55) 0%, rgba(40, 55, 35, 0.28) 34%, transparent 64%), linear-gradient(115deg, rgba(40, 55, 35, 0.42) 0%, rgba(40, 55, 35, 0.12) 38%, transparent 60%)';

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

const watercolorBleedSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    backgroundImage:
      'radial-gradient(ellipse 58% 52% at 88% 86%, rgb(217 194 122 / 0.28), transparent 72%), radial-gradient(ellipse 46% 42% at 98% 62%, rgb(231 212 138 / 0.2), transparent 74%), radial-gradient(ellipse 50% 46% at 74% 98%, rgb(138 154 91 / 0.22), transparent 70%)',
    filter: 'blur(28px)',
    mixBlendMode: 'multiply',
  },
  zIndex: 2,
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

const copySx: SxObject = {
  '@container now-playing (max-width: 25.5rem)': {
    width: '74%',
  },
  minWidth: 0,
  width: '46%',
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
  '@container now-playing (max-width: 25.5rem)': {
    '& .MuiTypography-root': {
      fontSize: '1.5rem',
    },
  },
  '& .MuiTypography-root': {
    color: CREAM.primary,
    fontSize: '1.75rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
    marginBottom: '0.2rem',
    textShadow: CREAM.primaryShadow,
  },
  marginTop: 0.35,
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

/**
 * Greenhouse now-playing tile: sage/gold wash, watercolor leaves, floating
 * notes, and a cream progress pill. Live `Track` pieces stay underneath.
 */
export function NowPlayingCard({ track }: { track: Track }) {
  const gradient = track.albumGradient ?? FALLBACK_WASH;

  return (
    <ContentCard data-bento="now-playing" sx={cardSx}>
      <Box aria-hidden="true" data-now-playing-wash="" sx={washSx} />
      <Box aria-hidden="true" sx={albumMixSx}>
        <AlbumGradientBackdrop containerSx={{ inset: 0 }} gradient={gradient} />
      </Box>
      <Box aria-hidden="true" sx={hueLockSx} />
      <Box aria-hidden="true" sx={watercolorBleedSx} />
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
      <Stack sx={layoutSx}>
        <Stack data-now-playing-copy="" sx={copySx}>
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
              listingVariant="card"
              textShadow={CREAM.secondaryShadow}
            />
          </Box>
        </Stack>
        <Box data-now-playing-progress="" sx={progressWrapSx}>
          <PlaybackProgressBar
            colors={CREAM}
            durationMs={track.durationMs}
            isPlaying={track.isPlaying}
            progressMs={track.progressMs}
          />
        </Box>
      </Stack>
    </ContentCard>
  );
}
