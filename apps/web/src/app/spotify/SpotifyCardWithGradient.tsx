'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ReactNode, useEffect, useState } from 'react';
import { extractAlbumGradientFromUrl } from './extractAlbumGradient';
import { SpotifyCardScrollTracker } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

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

function SpotifyCardShell({ children, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      {gradient ? <Box aria-hidden="true" sx={getGradientGlowSx(gradient)} /> : null}
      <ContentCard sx={getCardSx(gradient)}>{children}</ContentCard>
    </Box>
  );
}

type SpotifyCardWithGradientProps = {
  track: Track;
};

/**
 * Client card that derives album-art gradient/contrast in the browser.
 * Keeps sharp (and its native libvips) out of the homepage server module graph.
 */
export function SpotifyCardWithGradient({ track }: SpotifyCardWithGradientProps) {
  const [displayTrack, setDisplayTrack] = useState(track);

  useEffect(() => {
    setDisplayTrack(track);
    let cancelled = false;
    extractAlbumGradientFromUrl(track.albumImage.url).then((info) => {
      if (cancelled) {
        return;
      }
      setDisplayTrack({
        ...track,
        albumGradient: info.backgroundGradient ?? undefined,
        albumGradientContrastSetting: info.contrastSetting ?? undefined,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [track]);

  return (
    <SpotifyCardScrollTracker>
      <SpotifyCardShell gradient={displayTrack.albumGradient}>
        <TrackListing track={displayTrack} />
      </SpotifyCardShell>
    </SpotifyCardScrollTracker>
  );
}
