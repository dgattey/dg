'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ReactNode, useEffect, useState } from 'react';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { type AlbumGradientInformation, extractAlbumGradientFromUrl } from './extractAlbumGradient';
import { SpotifyCardScrollTracker } from './SpotifyCardScrollTracker';
import { TrackListing } from './TrackListing';

/**
 * How far the album's colors are allowed to spill past the card.
 * - `card` — the homepage grid's tight halo, hugging the card's own edges.
 * - `ambient` — a wide, soft bloom for the forest map, where the now-playing
 *   clearing is supposed to light the trees around it.
 */
export type AlbumGlowVariant = 'ambient' | 'card';

type SpotifyCardShellProps = {
  children: ReactNode;
  glowVariant: AlbumGlowVariant;
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

const ambientGradientGlowSx: SxObject = {
  borderRadius: '50%',
  filter: 'blur(64px)',
  inset: -110,
  opacity: 0.62,
  zIndex: 0,
};

const GLOW_SX: Record<AlbumGlowVariant, SxObject> = {
  ambient: ambientGradientGlowSx,
  card: gradientGlowSx,
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

function SpotifyCardShell({ children, glowVariant, gradient }: SpotifyCardShellProps) {
  return (
    <Box sx={shellContainerSx}>
      <AlbumGradientBackdrop containerSx={GLOW_SX[glowVariant]} gradient={gradient} />
      <ContentCard sx={cardSx}>
        <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
        {children}
      </ContentCard>
    </Box>
  );
}

type SpotifyCardWithGradientProps = {
  /** Spread of the outer album-art glow. Defaults to the grid's tight halo. */
  glowVariant?: AlbumGlowVariant;
  track: Track;
};

/**
 * Client card that derives album-art gradient/contrast in the browser.
 * Keeps sharp (and its native libvips) out of the homepage server module graph.
 */
export function SpotifyCardWithGradient({
  glowVariant = 'card',
  track,
}: SpotifyCardWithGradientProps) {
  const [gradientInformation, setGradientInformation] = useState<AlbumGradientInformation>({
    backgroundGradient: track.albumGradient ?? null,
    contrastSetting: track.albumGradientContrastSetting ?? null,
  });

  useEffect(() => {
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

  return (
    <SpotifyCardScrollTracker>
      <SpotifyCardShell glowVariant={glowVariant} gradient={trackWithCurrentGradient.albumGradient}>
        <TrackListing track={trackWithCurrentGradient} />
      </SpotifyCardShell>
    </SpotifyCardScrollTracker>
  );
}
