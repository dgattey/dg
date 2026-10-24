'use client';

import type { TileComponentProps } from 'pigeon-maps';
import { type CSSProperties, type RefObject, useEffect, useState } from 'react';

const tileImageStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

/** Lazy, so a hidden scheme's tiles never load until that scheme shows. */
export function SmoothTile({ tile, tileLoaded }: TileComponentProps) {
  return (
    <div
      style={{
        height: tile.height,
        left: tile.left,
        opacity: tile.active ? 1 : 0,
        overflow: 'hidden',
        position: 'absolute',
        top: tile.top,
        transition: 'opacity 0.2s',
        width: tile.width,
      }}
    >
      <img
        alt=""
        loading="lazy"
        onLoad={tileLoaded}
        src={tile.url}
        srcSet={tile.srcSet}
        style={tileImageStyle}
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
