'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { Leaf, Music, Music2, Music3, Music4 } from 'lucide-react';
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
const FALLBACK_WASH = 'linear-gradient(155deg, #d2cd90 0%, #c2b468 40%, #8f9a56 72%, #6d8348 100%)';

const CREAM: Colors = {
  primary: 'rgba(255, 248, 230, 0.96)',
  primaryContrast: 'rgba(48, 40, 16, 0.22)',
  primaryShadow: '0 1px 2px rgba(40, 28, 8, 0.16)',
  secondary: 'rgba(255, 244, 214, 0.78)',
  secondaryShadow: '0 1px 2px rgba(40, 28, 8, 0.1)',
};

const SAGE_GOLD_WASH =
  'radial-gradient(ellipse 62% 58% at 96% 10%, rgb(255 230 140 / 0.95) 0%, transparent 64%), radial-gradient(ellipse 46% 42% at 6% 88%, rgb(96 114 56 / 0.55) 0%, transparent 70%), linear-gradient(108deg, #8f9a54 0%, #b8ae68 42%, #e8d48c 100%)';

const layerBaseSx: SxObject = {
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
};

const cardSx: SxObject = {
  display: 'flex',
  height: '100%',
  isolation: 'isolate',
  minHeight: { md: '15rem', xs: '16.5rem' },
  overflow: 'hidden',
  padding: 2.25,
  position: 'relative',
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
      'linear-gradient(155deg, rgb(210 200 120 / 0.55) 0%, rgb(168 156 72 / 0.42) 46%, rgb(110 132 72 / 0.5) 100%)',
    borderRadius: 'inherit',
    mixBlendMode: 'color',
    opacity: 0.46,
  },
  zIndex: 2,
};

const watercolorBleedSx: SxObject = {
  ...layerBaseSx,
  '[data-greenhouse-frame] &': {
    backgroundImage:
      'radial-gradient(ellipse 46% 40% at 94% 86%, rgb(88 104 48 / 0.38), transparent 70%), radial-gradient(ellipse 34% 38% at 80% 100%, rgb(154 136 58 / 0.32), transparent 68%), radial-gradient(ellipse 30% 34% at 102% 62%, rgb(112 124 60 / 0.26), transparent 66%)',
    filter: 'blur(5px)',
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
  justifyContent: 'space-between',
  minHeight: 0,
  position: 'relative',
  zIndex: 5,
};

const headerSx: SxObject = {
  alignItems: 'center',
  flexDirection: 'row',
  gap: 1,
};

const leafBadgeSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'rgb(255 248 236 / 0.92)',
  borderRadius: '999px',
  color: 'rgb(72 82 40 / 0.78)',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  width: 28,
};

const titleSx: SxObject = {
  '& .MuiTypography-root': {
    color: CREAM.primary,
    fontSize: 'clamp(1.7rem, 1.25rem + 1.6vw, 2.25rem)',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.12,
    textShadow: CREAM.primaryShadow,
  },
  marginTop: 0.75,
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
  marginTop: 1.5,
};

const RESTING_NOTES = [
  { Icon: Music, left: '38%', rotate: '-16deg', size: 18, top: '10%' },
  { Icon: Music2, left: '56%', rotate: '12deg', size: 16, top: '18%' },
  { Icon: Music3, left: '72%', rotate: '-8deg', size: 20, top: '8%' },
  { Icon: Music4, left: '48%', rotate: '18deg', size: 14, top: '36%' },
  { Icon: Music, left: '82%', rotate: '8deg', size: 15, top: '32%' },
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
      <WatercolorLeaves />
      <RestingNotes />
      <Box aria-hidden="true" sx={notesOriginSx}>
        <MusicNotes isPlaying={Boolean(track.isPlaying)} noteColor={CREAM.primary} variant="card" />
      </Box>
      <Stack sx={layoutSx}>
        <Stack>
          <Stack sx={headerSx}>
            <Box aria-hidden="true" sx={leafBadgeSx}>
              <Leaf size={14} />
            </Box>
            <PlaybackStatus
              color={CREAM.primary}
              isPlaying={track.isPlaying}
              listingVariant="card"
              playedAt={track.playedAt}
              textShadow={CREAM.primaryShadow}
            />
          </Stack>
          <Box sx={titleSx}>
            <TrackTitle
              color={CREAM.primary}
              listingVariant="card"
              textShadow={CREAM.primaryShadow}
              trackTitle={track.name}
              url={track.externalUrls.spotify}
            />
          </Box>
          <Box sx={artistSx}>
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
