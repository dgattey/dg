import type { CSSProperties, ReactElement } from 'react';
import type { RouteFrame } from './routeFrame';
import { project } from './routeGeometry';
import { outdoorsTileUrl, type TileSource } from './tileSource';

const TILE_WAIT_MS = 1200;

/** Resolves once every tile is decoded (or the wait runs out), so mounting them paints at once. */
export const preloadTiles = (tiles: ReadonlyArray<{ src: string; srcSet: string }>) =>
  Promise.race([
    Promise.all(
      tiles.map(({ src, srcSet }) => {
        const img = new Image();
        img.srcset = srcSet;
        img.src = src;
        return img.decode().catch(() => undefined);
      }),
    ),
    new Promise((resolve) => setTimeout(resolve, TILE_WAIT_MS)),
  ]);

type TileFrame = RouteFrame & { dark: boolean; tileSource: TileSource };

type GridTile = { col: number; key: string; row: number; src: string; srcSet: string };

/** The tiles covering a frame, keyed by z/x/y, and the box transform that places them. */
export function tileGrid({ center, dark, height, tileSource, width, zoom }: TileFrame) {
  const tz = Math.round(zoom);
  const ts = 2 ** (zoom - tz);
  const { x: px, y: py } = project(center);
  const cx = px * 2 ** tz;
  const cy = py * 2 ** tz;
  const minX = Math.max(Math.floor(cx - width / ts / 512), 0);
  const maxX = Math.min(Math.floor(cx + width / ts / 512), 2 ** tz - 1);
  const minY = Math.max(Math.floor(cy - height / ts / 512), 0);
  const maxY = Math.min(Math.floor(cy + height / ts / 512), 2 ** tz - 1);
  const tiles: Array<GridTile> = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const url = (dpr?: number) => outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tz });
      tiles.push({
        col: x - minX,
        key: `${tz}/${x}/${y}`,
        row: y - minY,
        src: url(),
        srcSet: `${url(1)}, ${url(2)} 2x`,
      });
    }
  }
  const lPct = ((0.5 + ((minX - cx) * 256 * ts) / width) * 100).toFixed(4);
  const tPct = ((0.5 + ((minY - cy) * 256 * ts) / height) * 100).toFixed(4);
  const sx = ((256 * ts) / width).toFixed(6);
  const sy = ((256 * ts) / height).toFixed(6);
  return { boxTransform: `translate3d(${lPct}%, ${tPct}%, 0px) scale(${sx}, ${sy})`, tiles };
}

export function frameTiles(frame: TileFrame): ReactElement {
  const { boxTransform, tiles } = tileGrid(frame);
  return (
    <div data-atlas-tile-stage="">
      <div data-atlas-tile-box="" style={{ '--box-transform': boxTransform } as CSSProperties}>
        {tiles.map(({ col, key, row, src, srcSet }) => (
          <div
            data-active="true"
            data-map-tile=""
            key={key}
            style={
              {
                '--tile-h': '100%',
                '--tile-left': `${col * 100}%`,
                '--tile-top': `${row * 100}%`,
                '--tile-w': '100%',
              } as CSSProperties
            }
          >
            <img
              alt=""
              data-map-tile-img=""
              decoding="async"
              loading="lazy"
              src={src}
              srcSet={srcSet}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
