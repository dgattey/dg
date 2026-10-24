'use client';

import { type CSSProperties, useState } from 'react';

type GradientLayer = {
  gradient: string;
  id: number;
};

type AlbumGradientBackdropProps = {
  gradient?: string;
  variant: 'glow' | 'surface';
};

/**
 * Paints the album gradient behind the now-playing card and dissolves between
 * tracks. Gradient stacks can't be interpolated by the browser, so each new
 * gradient fades in on its own layer above the one it replaces, and spent
 * layers are dropped once the incoming one is fully opaque.
 */
export function AlbumGradientBackdrop({ gradient, variant }: AlbumGradientBackdropProps) {
  const [layers, setLayers] = useState<Array<GradientLayer>>([]);
  const newest = layers.at(-1);

  if (newest?.gradient !== gradient) {
    setLayers(gradient ? [...layers, { gradient, id: (newest?.id ?? -1) + 1 }] : []);
  }

  const dropSpentLayers = (finishedId: number) => {
    setLayers((current) => (current.at(-1)?.id === finishedId ? current.slice(-1) : current));
  };

  return (
    <div aria-hidden="true" data-gradient-backdrop={variant}>
      {layers.map((layer) => (
        <div
          data-gradient-layer=""
          key={layer.id}
          onAnimationEnd={() => dropSpentLayers(layer.id)}
          style={{ '--album-gradient': layer.gradient } as CSSProperties}
        />
      ))}
    </div>
  );
}
