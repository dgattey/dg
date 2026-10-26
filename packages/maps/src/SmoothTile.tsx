'use client';

import type { TileComponentProps } from 'pigeon-maps';
import { type CSSProperties, type RefObject, useEffect, useState } from 'react';

const rasterTileCache = new Map<string, string>();
const pendingRasterLoads = new Map<string, Promise<string>>();

function rasterizeSvgDataUri(svgUri: string): Promise<string> {
  const cached = rasterTileCache.get(svgUri);
  if (cached) {
    return Promise.resolve(cached);
  }
  const existing = pendingRasterLoads.get(svgUri);
  if (existing) {
    return existing;
  }
  const promise = new Promise<string>((resolve) => {
    const img = new Image(256, 256);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 256, 256);
          const pngUri = canvas.toDataURL('image/png');
          rasterTileCache.set(svgUri, pngUri);
          resolve(pngUri);
          return;
        }
      } catch {}
      resolve(svgUri);
    };
    img.onerror = () => resolve(svgUri);
    img.src = svgUri;
  });
  pendingRasterLoads.set(svgUri, promise);
  return promise;
}

/** Lazy for network tiles, so a hidden scheme's tiles never load until that scheme shows. */
export function SmoothTile({ tile }: TileComponentProps) {
  const isSvgData = tile.url.startsWith('data:image/svg+xml,');
  const [rasterUrl, setRasterUrl] = useState<string | null>(() =>
    isSvgData ? (rasterTileCache.get(tile.url) ?? null) : null,
  );

  useEffect(() => {
    if (!isSvgData || rasterTileCache.has(tile.url)) {
      return;
    }
    let cancelled = false;
    void rasterizeSvgDataUri(tile.url).then((pngUri) => {
      if (!cancelled) {
        setRasterUrl(pngUri);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isSvgData, tile.url]);

  if (!tile.active) {
    return <></>;
  }
  const isDataUri = tile.url.startsWith('data:');
  const resolvedUrl = isSvgData
    ? (rasterUrl ?? rasterTileCache.get(tile.url) ?? tile.url)
    : tile.url;
  const tileVars = {
    '--tile-h': `${tile.height}px`,
    '--tile-left': `${tile.left}px`,
    '--tile-top': `${tile.top}px`,
    '--tile-w': `${tile.width}px`,
  } as CSSProperties;
  return (
    <div data-active="true" data-map-tile="" style={tileVars}>
      <img
        alt=""
        data-map-tile-img=""
        decoding={isDataUri ? undefined : 'async'}
        loading={isDataUri ? undefined : 'lazy'}
        src={resolvedUrl}
        srcSet={tile.srcSet || undefined}
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
    if (disabled || !element || typeof ResizeObserver === 'undefined') {
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
