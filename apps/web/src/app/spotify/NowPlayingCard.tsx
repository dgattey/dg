'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack } from '@mui/material';
import { Leaf, Music, Music2, Music3 } from 'lucide-react';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { ArtistList } from './ArtistList';
import { getContrastingColors } from './colors';
import { MusicNotes } from './MusicNotes';
import { PlaybackProgressBar } from './PlaybackProgressBar';
import { PlaybackStatus } from './PlaybackStatus';
import { TrackTitle } from './TrackTitle';

const FALLBACK_WASH = 'linear-gradient(155deg, #d8d4a0 0%, #c4b86a 46%, #9aa058 78%, #7a8a4a 100%)';

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
  backgroundImage: FALLBACK_WASH,
  borderRadius: 'inherit',
  inset: 0,
  opacity: 0.78,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
};

const gradientSx: SxObject = {
  borderRadius: 'inherit',
  inset: 0,
  mixBlendMode: 'soft-light',
  opacity: 0.4,
  zIndex: 1,
};

const botanicalSx: SxObject = {
  color: 'rgba(72, 48, 16, 0.38)',
  height: '100%',
  opacity: 1,
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  top: 0,
  width: '72%',
  zIndex: 2,
};

const notesOriginSx: SxObject = {
  left: '74%',
  pointerEvents: 'none',
  position: 'absolute',
  top: '32%',
  zIndex: 3,
};

const staticNotesSx: SxObject = {
  color: 'rgba(48, 28, 10, 0.45)',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 3,
};

const progressWrapSx: SxObject = {
  '& > div': {
    backgroundColor: 'rgba(255, 255, 255, 0.32) !important',
    height: '5px !important',
    marginTop: '0 !important',
  },
  '& > div > div': {
    backgroundColor: 'rgba(255, 248, 230, 0.95) !important',
  },
  marginTop: 1.5,
};

const layoutSx: SxObject = {
  flex: 1,
  justifyContent: 'space-between',
  minHeight: 0,
  position: 'relative',
  zIndex: 4,
};

const headerSx: SxObject = {
  alignItems: 'center',
  flexDirection: 'row',
  gap: 1,
};

const leafBadgeSx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-common-white) 38%, transparent)',
  borderRadius: '999px',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  width: 28,
};

const titleSx: SxObject = {
  '& .MuiTypography-root': {
    fontSize: 'clamp(1.45rem, 1.15rem + 1.2vw, 1.85rem)',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
  marginTop: 0.75,
};

/**
 * Line-art tropical leaves in the wash. Decorative only.
 */
function BotanicalAccent() {
  return (
    <Box aria-hidden="true" sx={botanicalSx}>
      <svg aria-hidden="true" fill="none" viewBox="0 0 280 320">
        <path
          d="M176 292c-18-54 6-108 58-148-8 48 6 96 38 128-42 22-72 22-96 20Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d="M92 38c48 22 78 70 70 132-38-8-78-40-92-86 8-18 14-32 22-46Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d="M118 86c18 28 22 58 8 86"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M48 168c44-8 86 10 112 48-36 18-82 22-118 8 4-22 6-40 6-56Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d="M154 196c22 18 34 42 32 70"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M206 72c28 36 28 86-6 124 34 4 62-22 74-56-10-28-32-52-68-68Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    </Box>
  );
}

function RestingNotes() {
  return (
    <Box aria-hidden="true" sx={staticNotesSx}>
      <Box sx={{ left: '58%', position: 'absolute', top: '18%', transform: 'rotate(-18deg)' }}>
        <Music size={18} />
      </Box>
      <Box sx={{ left: '78%', position: 'absolute', top: '28%', transform: 'rotate(12deg)' }}>
        <Music2 size={16} />
      </Box>
      <Box sx={{ left: '66%', position: 'absolute', top: '48%', transform: 'rotate(8deg)' }}>
        <Music3 size={14} />
      </Box>
    </Box>
  );
}

/**
 * Greenhouse now-playing tile: color wash from art, floating notes, progress,
 * and a botanical accent. Live `TrackListing` pieces stay underneath.
 */
export function NowPlayingCard({ track }: { track: Track }) {
  const colors = getContrastingColors(track);
  const gradient = track.albumGradient ?? FALLBACK_WASH;
  const noteColor = colors?.primary ?? 'rgba(40, 24, 8, 0.72)';

  return (
    <ContentCard data-bento="now-playing" sx={cardSx}>
      <Box aria-hidden="true" sx={washSx} />
      <AlbumGradientBackdrop containerSx={gradientSx} gradient={gradient} />
      <BotanicalAccent />
      <RestingNotes />
      <Box aria-hidden="true" sx={notesOriginSx}>
        <MusicNotes isPlaying={Boolean(track.isPlaying)} noteColor={noteColor} />
      </Box>
      <Stack sx={layoutSx}>
        <Stack>
          <Stack sx={headerSx}>
            <Box aria-hidden="true" sx={leafBadgeSx}>
              <Leaf size={14} />
            </Box>
            <PlaybackStatus
              color={colors?.primary}
              isPlaying={track.isPlaying}
              listingVariant="card"
              playedAt={track.playedAt}
              textShadow={colors?.primaryShadow}
            />
          </Stack>
          <Box sx={titleSx}>
            <TrackTitle
              color={colors?.primary}
              listingVariant="card"
              textShadow={colors?.primaryShadow}
              trackTitle={track.name}
              url={track.externalUrls.spotify}
            />
          </Box>
          <ArtistList
            artists={track.artists}
            color={colors?.secondary}
            listingVariant="card"
            textShadow={colors?.secondaryShadow}
          />
        </Stack>
        <Box sx={progressWrapSx}>
          <PlaybackProgressBar
            colors={colors}
            durationMs={track.durationMs}
            isPlaying={track.isPlaying}
            progressMs={track.progressMs}
          />
        </Box>
      </Stack>
    </ContentCard>
  );
}
