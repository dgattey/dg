import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, keyframes, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { NowPlayingAnimation } from '../spotify/NowPlayingAnimation';
import { TrackListing } from '../spotify/TrackListing';

const IMAGE_SIZE = 150;

type SpotifyCardShellProps = {
  children: ReactNode;
  gradient?: string;
  isPlaying?: boolean;
  noteColor?: string;
};

// Subtle bounce animation for the whole card
const cardBounce = keyframes`
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.012) translateY(-2px);
  }
`;

const getShellContainerSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${cardBounce} 1.8s ease-in-out infinite` : 'none',
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
  willChange: isPlaying ? 'transform' : 'auto',
});

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
  padding: 2.5,
  position: 'relative',
  zIndex: 1,
};

const getCardSx = (gradient?: string): SxObject => ({
  ...(gradient ? { backgroundImage: gradient } : {}),
  ...cardSx,
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

function SpotifyCardShell({ children, gradient, isPlaying, noteColor }: SpotifyCardShellProps) {
  const playing = Boolean(isPlaying);
  return (
    <Box sx={getShellContainerSx(playing)}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
      {/* Animation outside ContentCard to avoid overflow:hidden clipping */}
      <NowPlayingAnimation isPlaying={playing} noteColor={noteColor} />
      <ContentCard sx={getCardSx(gradient)}>{children}</ContentCard>
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
 * Gets a color for music notes based on whether the gradient is dark
 */
function getNoteColor(isDark?: boolean): string {
  if (isDark === undefined) {
    return 'rgba(128, 128, 128, 0.6)';
  }
  return isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
}

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
