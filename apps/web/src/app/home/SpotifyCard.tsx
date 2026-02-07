import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Link } from '@dg/ui/dependent/Link';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { ALBUM_ART_BORDER_RADIUS, ALBUM_ART_DIMENSIONS } from '../spotify/AlbumImage';
import { TrackListing } from '../spotify/TrackListing';

type SpotifyCardShellProps = {
  children: ReactNode;
  gradient?: string;
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
  ...ALBUM_ART_DIMENSIONS,
  ...ALBUM_ART_BORDER_RADIUS,
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
};

const loadingStatusSx: SxObject = {
  marginBottom: 0.5,
};

const loadingTitleSx: SxObject = {
  marginBottom: 1,
};

const historyLinkSx: SxObject = {
  fontSize: '0.75rem',
  opacity: 0.7,
};

function SpotifyCardShell({ children, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
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
 * Shows a card with the latest data from Spotify
 */
export function SpotifyCard({ track }: SpotifyCardProps) {
  if (!track) {
    return null;
  }

  return (
    <SpotifyCardShell gradient={track.albumGradient}>
      <Stack spacing={1}>
        <TrackListing track={track} />
        <Link href="/spotify/history" sx={historyLinkSx}>
          History
        </Link>
      </Stack>
    </SpotifyCardShell>
  );
}
