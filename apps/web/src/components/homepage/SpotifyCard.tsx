import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { MusicNotes } from '../spotify/MusicNotes';
import { TrackListing } from '../spotify/TrackListing';

const IMAGE_SIZE = 150;

type SpotifyCardShellProps = {
  children: ReactNode;
  gradient?: string;
  isPlaying?: boolean;
  noteColor?: string;
};

const shellContainerSx: SxObject = {
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
};

const getGradientGlowSx = (gradient: string): SxObject => ({
  backgroundImage: gradient,
  borderRadius: 6,
  filter: 'blur(16px)',
  inset: -2,
  opacity: 0.5,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
});

const cardSx: SxObject = {
  display: 'flex',
  minWidth: { md: 'auto', xs: 'min(max-content, inherit)' },
  overflow: 'visible',
  padding: 2.5,
  position: 'relative',
  zIndex: 1,
};

const getCardSx = (gradient?: string): SxObject => ({
  ...(gradient ? { backgroundImage: gradient } : {}),
  ...cardSx,
});

// Notes layer positioned at album art center
const getNotesLayerSx = (isPlaying: boolean): SxObject => ({
  display: isPlaying ? 'block' : 'none',
  pointerEvents: 'none',
  position: 'absolute',
  right: {
    md: `calc(20px + ${IMAGE_SIZE / 2}px)`,
    sm: `calc(20px + ${IMAGE_SIZE / 3}px)`,
    xs: `calc(20px + ${IMAGE_SIZE / 4}px)`,
  },
  top: {
    md: `calc(20px + ${IMAGE_SIZE / 2}px)`,
    sm: `calc(20px + ${IMAGE_SIZE / 3}px)`,
    xs: `calc(20px + ${IMAGE_SIZE / 4}px)`,
  },
  zIndex: 1,
});

const loadingLayoutSx: SxObject = {
  flex: 1,
  gap: 1,
  justifyContent: 'space-between',
};

const loadingHeaderSx: SxObject = {
  gap: 6,
  justifyContent: 'space-between',
};

const loadingLogoSx: SxObject = {
  fontSize: '3rem',
  lineHeight: 1,
  opacity: 0.3,
};

const loadingCardSx: SxObject = {
  '--image-dim': {
    md: `${IMAGE_SIZE}px`,
    sm: `${(2 * IMAGE_SIZE) / 3}px`,
    xs: `${IMAGE_SIZE / 2}px`,
  },
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  borderRadius: { md: 6, sm: 4, xs: 2 },
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
};

const loadingStatusSx: SxObject = {
  marginBottom: 0.5,
};

const loadingTitleSx: SxObject = {
  marginBottom: 1,
};

/**
 * Gets note color matching the "Now Playing" text color
 */
function getNoteColor(isDark?: boolean): string {
  if (isDark === true) {
    return 'rgba(255, 255, 255, 0.7)';
  }
  if (isDark === false) {
    return 'rgba(0, 0, 0, 0.7)';
  }
  return 'rgba(128, 128, 128, 0.7)';
}

function SpotifyCardShell({ children, gradient, isPlaying, noteColor }: SpotifyCardShellProps) {
  const playing = Boolean(isPlaying);
  return (
    <Box sx={shellContainerSx}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
      <ContentCard sx={getCardSx(gradient)}>
        <Box sx={getNotesLayerSx(playing)}>
          <MusicNotes isPlaying={playing} noteColor={noteColor} />
        </Box>
        {children}
      </ContentCard>
    </Box>
  );
}

/**
 * Loading skeleton for SpotifyCard shown during Suspense.
 */
export function SpotifyCardLoading() {
  return (
    <SpotifyCardShell>
      <Stack sx={loadingLayoutSx}>
        <Stack direction="row" sx={loadingHeaderSx}>
          <Box sx={loadingLogoSx}>
            <FaIcon icon={faSpotify} size="1em" />
          </Box>
          <Card sx={loadingCardSx}>
            <Skeleton height="100%" variant="rectangular" width="100%" />
          </Card>
        </Stack>
        <Stack>
          <Skeleton height={20} sx={loadingStatusSx} width={100} />
          <Skeleton height={32} sx={loadingTitleSx} width="80%" />
          <Skeleton height={20} width="60%" />
        </Stack>
      </Stack>
    </SpotifyCardShell>
  );
}

type SpotifyCardProps = {
  track: Track | null;
};

/**
 * Shows a card with the latest data from Spotify
 */
export function SpotifyCard({ track }: SpotifyCardProps) {
  if (!track) {
    return null;
  }

  return (
    <SpotifyCardShell
      gradient={track.albumGradient}
      isPlaying={track.isPlaying}
      noteColor={getNoteColor(track.albumGradientIsDark)}
    >
      <TrackListing hasLogo track={track} />
    </SpotifyCardShell>
  );
}
