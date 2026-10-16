'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Box } from '@dg/ui/core/Box';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import type { ReactNode } from 'react';
import {
  ALBUM_GRADIENT_GLOW_SX,
  ALBUM_GRADIENT_SURFACE_SX,
  AlbumGradientBackdrop,
} from './AlbumGradientBackdrop';
import { NOW_PLAYING_CARD_ID, useNowPlaying } from './NowPlayingContext';
import { TrackListing } from './TrackListing';
import { useAlbumGradient } from './useAlbumGradient';

type SpotifyCardShellProps = {
  children: ReactNode;
  gradient?: string;
};

const anchorSx: SxObject = { scrollMarginTop: 120 };

// The shell sits inside the anchor grid item, so it has to pass the cell
// height down or the card sizes to its contents and sits short of neighbors.
const shellContainerSx: SxObject = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
};

const cardSx: SxObject = {
  display: 'flex',
  height: '100%',
  minWidth: { md: 'auto', xs: 'min(max-content, inherit)' },
  overflow: 'visible',
  padding: 2.5,
  position: 'relative',
  zIndex: 1,
};

function SpotifyCardShell({ children, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      <AlbumGradientBackdrop containerSx={ALBUM_GRADIENT_GLOW_SX} gradient={gradient} />
      <ContentCard sx={cardSx}>
        <AlbumGradientBackdrop containerSx={ALBUM_GRADIENT_SURFACE_SX} gradient={gradient} />
        {children}
      </ContentCard>
    </Box>
  );
}

type SpotifyCardWithGradientProps = {
  track: Track;
};

/**
 * Classic client card that derives album-art gradient/contrast in the browser.
 * Collage bypasses this wrapper and renders `SpotifyCollageCard` directly.
 */
export function SpotifyCardWithGradient({ track: serverTrack }: SpotifyCardWithGradientProps) {
  const trackWithCurrentGradient = useAlbumGradient(useNowPlaying(serverTrack) ?? serverTrack);

  return (
    <Box id={NOW_PLAYING_CARD_ID} sx={anchorSx}>
      <SpotifyCardShell gradient={trackWithCurrentGradient.albumGradient}>
        <TrackListing track={trackWithCurrentGradient} />
      </SpotifyCardShell>
    </Box>
  );
}
