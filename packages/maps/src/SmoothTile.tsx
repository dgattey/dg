'use client';

import type { TileComponentProps } from 'pigeon-maps';
import { type CSSProperties, type RefObject, useEffect, useState } from 'react';

/** Lazy, so a hidden scheme's tiles never load until that scheme shows. */
export function SmoothTile({ tile, tileLoaded }: TileComponentProps) {
  const tileVars = {
    '--tile-h': `${tile.height}px`,
    '--tile-left': `${tile.left}px`,
    '--tile-top': `${tile.top}px`,
    '--tile-w': `${tile.width}px`,
  } as CSSProperties;
  return (
    <div data-active={tile.active ? 'true' : undefined} data-map-tile="" style={tileVars}>
      <img
        alt=""
        data-map-tile-img=""
        loading="lazy"
        onLoad={tileLoaded}
        src={tile.url}
        srcSet={tile.srcSet}
      />
    </div>
  );
}

/**
 * Measures an element's `borderBoxSize`, which ignores ancestor transforms
 * (rotated collage cards) while preserving fractional pixels unless `round` is set.
 */
export function useHostSize(
  ref: RefObject<HTMLElement | null>,
  initialSize: { height: number; width: number },
  options?: { disabled?: boolean; round?: boolean },
) {
  const [size, setSize] = useState(initialSize);
  const disabled = options?.disabled ?? false;
  const round = options?.round ?? false;

  useEffect(() => {
    const element = ref.current;
    if (disabled || !element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (box && box.blockSize > 0 && box.inlineSize > 0) {
        setSize({
          height: round ? Math.round(box.blockSize) : box.blockSize,
          width: round ? Math.round(box.inlineSize) : box.inlineSize,
        });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [disabled, ref, round]);

  return size;
}
