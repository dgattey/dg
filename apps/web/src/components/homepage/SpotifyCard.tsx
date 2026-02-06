import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { MusicNotes } from '../spotify/PlayingIndicator';
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
  padding: 2.5,
  position: 'relative',
  zIndex: 1,
};

const getCardSx = (gradient?: string): SxObject => ({
  ...(gradient ? { backgroundImage: gradient } : {}),
  ...cardSx,
});

// Notes layer positioned to align with album art (top-right of card)
// This sits outside ContentCard to avoid overflow:hidden clipping
const notesLayerSx: SxObject = {
  // Position relative to the shell, aligned with album art location
  pointerEvents: 'none',
  position: 'absolute',
  // Album art is in top-right with padding of 2.5 (20px) from edges
  // Album size varies by breakpoint
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
  zIndex: 1, // Above card background, below album art
};

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
  return (
    <Box sx={shellContainerSx}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
      {/* Notes layer outside ContentCard to avoid overflow clipping */}
      <Box sx={notesLayerSx}>
        <MusicNotes isPlaying={Boolean(isPlaying)} noteColor={noteColor} />
      </Box>
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
 * Extracts a color from a CSS gradient string for use on music notes.
 * Falls back to a semi-transparent gray if no gradient.
 */
function extractGradientColor(gradient?: string, isDark?: boolean): string {
  if (!gradient) {
    return 'rgba(128, 128, 128, 0.6)';
  }

  // Extract hex colors from gradient (e.g., "linear-gradient(135deg, #abc123, #def456)")
  const hexMatch = gradient.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g);
  if (hexMatch?.[0]) {
    // Use the first color from gradient with some transparency
    const hex = hexMatch[0];
    // Convert hex to rgba with appropriate opacity based on dark/light
    const opacity = isDark ? 0.85 : 0.7;
    return hexToRgba(hex, opacity);
  }

  // Fallback based on dark/light
  return isDark ? 'rgba(200, 200, 200, 0.7)' : 'rgba(80, 80, 80, 0.6)';
}

/**
 * Converts a hex color to rgba with specified opacity.
 */
function hexToRgba(hex: string, opacity: number): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) {
    return `rgba(128, 128, 128, ${opacity})`;
  }
  const r = Number.parseInt(result[1] ?? '0', 16);
  const g = Number.parseInt(result[2] ?? '0', 16);
  const b = Number.parseInt(result[3] ?? '0', 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
      noteColor={extractGradientColor(track.albumGradient, track.albumGradientIsDark)}
    >
      <TrackListing hasLogo track={track} />
    </SpotifyCardShell>
  );
}
