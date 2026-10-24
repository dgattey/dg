'use client';

import { EASING_DEFAULT, TIMING_SLOW } from '@dg/ui/helpers/timing';
import { type CSSProperties, useState } from 'react';

const GRADIENT_CROSSFADE_MS = TIMING_SLOW;

const ALBUM_GRADIENT_CSS = `
@keyframes albumGradientFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

const containerBaseStyle: CSSProperties = {
  pointerEvents: 'none',
  position: 'absolute',
};

const layerStyle: CSSProperties = {
  animation: `albumGradientFadeIn ${GRADIENT_CROSSFADE_MS}ms ${EASING_DEFAULT}`,
  borderRadius: 'inherit',
  inset: 0,
  position: 'absolute',
};

export const ALBUM_GRADIENT_GLOW_STYLE: CSSProperties = {
  borderRadius: 24,
  inset: -4,
  opacity: 0.36,
  zIndex: 0,
};

type GradientLayer = {
  gradient: string;
  id: number;
};

type AlbumGradientBackdropProps = {
  gradient?: string;
  containerStyle: CSSProperties;
};

/**
 * Paints the album gradient behind the now-playing card and dissolves between
 * tracks. Gradient stacks can't be interpolated by the browser, so each new
 * gradient fades in on its own layer above the one it replaces, and spent
 * layers are dropped once the incoming one is fully opaque.
 */
export function AlbumGradientBackdrop({ gradient, containerStyle }: AlbumGradientBackdropProps) {
  const [layers, setLayers] = useState<Array<GradientLayer>>([]);
  const newest = layers.at(-1);

  if (newest?.gradient !== gradient) {
    setLayers(gradient ? [...layers, { gradient, id: (newest?.id ?? -1) + 1 }] : []);
  }

  const dropSpentLayers = (finishedId: number) => {
    setLayers((current) => (current.at(-1)?.id === finishedId ? current.slice(-1) : current));
  };

  return (
    <div aria-hidden="true" style={{ ...containerBaseStyle, ...containerStyle }}>
      <style href="dg-album-gradient" precedence="default">
        {ALBUM_GRADIENT_CSS}
      </style>
      {layers.map((layer) => (
        <div
          data-gradient-layer
          key={layer.id}
          onAnimationEnd={() => dropSpentLayers(layer.id)}
          style={{ ...layerStyle, backgroundImage: layer.gradient }}
        />
      ))}
    </div>
  );
}
