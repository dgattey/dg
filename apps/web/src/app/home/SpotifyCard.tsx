import 'server-only';

import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { FaIcon } from '@dg/ui/icons/FaIcon';
import type { SxObject } from '@dg/ui/theme';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { Box, Card, Skeleton, Stack } from '@mui/material';
import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { ALBUM_ART_BORDER_RADIUS, ALBUM_ART_DIMENSIONS } from '../spotify/albumArtStyles';
import { SpotifyCardWithGradient } from '../spotify/SpotifyCardWithGradient';

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

// Fill the grid cell while loading so a short skeleton does not leave a gap
// next to full-height neighbors.
const loadingShellSx: SxObject = {
  display: 'flex',
  height: '100%',
  minWidth: { md: 'auto', xs: 'min(max-content, inherit)' },
  overflow: 'visible',
  padding: 2.5,
};

/**
 * Loading skeleton shown during Suspense.
 */
function SpotifyCardLoading() {
  return (
    <ContentCard sx={loadingShellSx}>
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
    </ContentCard>
  );
}

/**
 * Async data-fetching wrapper. Fetches the latest song server-side
 * and renders the client card that derives its gradient from album art.
 */
async function SpotifyCardAsync() {
  const track = await getLatestSong();
  if (!track) {
    return null;
  }
  return <SpotifyCardWithGradient track={track} />;
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
