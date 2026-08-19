'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ReactNode, useEffect, useState } from 'react';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { type AlbumGradientInformation, extractAlbumGradientFromUrl } from './extractAlbumGradient';
import { NowPlayingCard } from './NowPlayingCard';
import { SpotifyCardScrollTracker } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

type SpotifyCardShellProps = {
  children: ReactNode;
  gradient?: string;
};

// The shell sits inside the scroll-tracker grid item, so it has to pass the
// cell height down or the card sizes to its contents and sits short of neighbors.
const shellContainerSx: SxObject = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
};

const gradientGlowSx: SxObject = {
  borderRadius: 6,
  filter: 'blur(16px)',
  inset: -2,
  opacity: 0.5,
  zIndex: 0,
};

/**
 * Sits behind the card's contents but above its paper background, inset by the
 * hairline border so the gradient still reaches the card's edges.
 */
const gradientSurfaceSx: SxObject = {
  borderRadius: 'inherit',
  inset: '-1px',
  zIndex: -1,
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
      <AlbumGradientBackdrop containerSx={gradientGlowSx} gradient={gradient} />
      <ContentCard sx={cardSx}>
        <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
        {children}
      </ContentCard>
    </Box>
  );
}

type SpotifyCardWithGradientProps = {
  track: Track;
  /**
   * `card` is today's homepage listing. `nowPlaying` is the greenhouse tile:
   * wash, notes, progress, botanical accent.
   */
  variant?: 'card' | 'nowPlaying';
};

/**
 * Client card that derives album-art gradient/contrast in the browser.
 * Keeps sharp (and its native libvips) out of the homepage server module graph.
 */
export function SpotifyCardWithGradient({ track, variant = 'card' }: SpotifyCardWithGradientProps) {
  const [gradientInformation, setGradientInformation] = useState<AlbumGradientInformation>({
    backgroundGradient: track.albumGradient ?? null,
    contrastSetting: track.albumGradientContrastSetting ?? null,
  });

  useEffect(() => {
    if (!track.albumImage.url.startsWith('http')) {
      return undefined;
    }
    let cancelled = false;
    extractAlbumGradientFromUrl(track.albumImage.url).then((info) => {
      if (cancelled) {
        return;
      }
      setGradientInformation(info);
    });
    return () => {
      cancelled = true;
    };
  }, [track.albumImage.url]);

  const trackWithCurrentGradient: Track = {
    ...track,
    albumGradient: gradientInformation.backgroundGradient ?? undefined,
    albumGradientContrastSetting: gradientInformation.contrastSetting ?? undefined,
  };

  if (variant === 'nowPlaying') {
    return (
      <SpotifyCardScrollTracker>
        <NowPlayingCard track={trackWithCurrentGradient} />
      </SpotifyCardScrollTracker>
    );
  }

  return (
    <SpotifyCardScrollTracker>
      <SpotifyCardShell gradient={trackWithCurrentGradient.albumGradient}>
        <TrackListing track={trackWithCurrentGradient} />
      </SpotifyCardShell>
    </SpotifyCardScrollTracker>
  );
}
