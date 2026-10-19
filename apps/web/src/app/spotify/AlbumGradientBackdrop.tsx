'use client';

import { Box } from '@dg/ui/core/Box';
import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { useState } from 'react';

const GRADIENT_CROSSFADE_MS = TIMING_SLOW;

const containerBaseSx: SxObject = {
  '@keyframes albumGradientFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  pointerEvents: 'none',
  position: 'absolute',
};

const layerSx: SxObject = {
  animation: `albumGradientFadeIn ${GRADIENT_CROSSFADE_MS}ms ${EASING_DEFAULT}`,
  borderRadius: 'inherit',
  inset: 0,
  position: 'absolute',
};

export const ALBUM_GRADIENT_GLOW_SX: SxObject = {
  borderRadius: 6,
  filter: 'blur(16px)',
  inset: -2,
  opacity: 0.5,
  zIndex: 0,
};

type GradientLayer = {
  gradient: string;
  id: number;
};

type AlbumGradientBackdropProps = {
  gradient?: string;
  containerSx: SxObject;
};

/**
 * Paints the album gradient behind the now-playing card and dissolves between
 * tracks. Gradient stacks can't be interpolated by the browser, so each new
 * gradient fades in on its own layer above the one it replaces, and spent
 * layers are dropped once the incoming one is fully opaque.
 */
export function AlbumGradientBackdrop({ gradient, containerSx }: AlbumGradientBackdropProps) {
  const [layers, setLayers] = useState<Array<GradientLayer>>([]);
  const newest = layers.at(-1);

  if (newest?.gradient !== gradient) {
    setLayers(gradient ? [...layers, { gradient, id: (newest?.id ?? -1) + 1 }] : []);
  }

  const dropSpentLayers = (finishedId: number) => {
    setLayers((current) => (current.at(-1)?.id === finishedId ? current.slice(-1) : current));
  };

  return (
    <Box aria-hidden="true" sx={{ ...containerBaseSx, ...containerSx }}>
      {layers.map((layer) => (
        <Box
          data-gradient-layer
          key={layer.id}
          onAnimationEnd={() => dropSpentLayers(layer.id)}
          sx={{ ...layerSx, backgroundImage: layer.gradient }}
        />
      ))}
    </Box>
  );
}
