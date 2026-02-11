import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, Skeleton, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { ALBUM_ART_BORDER_RADIUS, ALBUM_ART_DIMENSIONS } from '../spotify/AlbumImage';
import { SpotifyCardScrollTracker } from '../spotify/SpotifyCardScrollTracker';
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

function SpotifyCardShell({ children, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
      <ContentCard sx={getCardSx(gradient)}>{children}</ContentCard>
    </Box>
  );
}

/**
 * Loading skeleton shown during Suspense.
 */
function SpotifyCardLoading() {
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

/**
 * Shows a card with the latest data from Spotify, wrapped in the
 * gradient shell and scroll tracker.
 */
function SpotifyCardContent({ track }: { track: Track | null }) {
  if (!track) {
    return null;
  }

  return (
    <SpotifyCardScrollTracker>
      <SpotifyCardShell gradient={track.albumGradient}>
        <TrackListing track={track} />
      </SpotifyCardShell>
    </SpotifyCardScrollTracker>
  );
}

/**
 * Async data-fetching wrapper. Fetches the latest song server-side
 * and renders the card content.
 */
async function SpotifyCardAsync() {
  const track = await getLatestSong();
  return <SpotifyCardContent track={track} />;
}

/**
 * Public entry point for the Spotify card on the homepage.
 * Wraps the async content in Suspense with a loading skeleton.
 */
export function SpotifyCardSlot() {
  return (
    <Suspense fallback={<SpotifyCardLoading />}>
      <SpotifyCardAsync />
    </Suspense>
  );
}
