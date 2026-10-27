import type { CSSProperties, ReactElement } from 'react';
import type { RouteFrame } from './routeFrame';
import { project } from './routeGeometry';
import { outdoorsTileUrl, type TileSource } from './tileSource';

export function frameTiles({
  center,
  dark,
  height,
  tileSource,
  width,
  zoom,
}: RouteFrame & { dark: boolean; tileSource: TileSource }): Array<ReactElement> {
  const tz = Math.round(zoom);
  const ts = 2 ** (zoom - tz);
  const { x: px, y: py } = project(center);
  const cx = px * 2 ** tz;
  const cy = py * 2 ** tz;
  const minX = Math.floor(cx - width / ts / 512);
  const maxX = Math.min(Math.floor(cx + width / ts / 512), 2 ** tz - 1);
  const minY = Math.floor(cy - height / ts / 512);
  const maxY = Math.min(Math.floor(cy + height / ts / 512), 2 ** tz - 1);
  const wPct = `${(((256 * ts) / width) * 100).toFixed(4)}%`;
  const hPct = `${(((256 * ts) / height) * 100).toFixed(4)}%`;
  const tiles: Array<ReactElement> = [];
  for (let x = Math.max(minX, 0); x <= maxX; x++) {
    for (let y = Math.max(minY, 0); y <= maxY; y++) {
      const url = (dpr?: number) => outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tz });
      const leftPct = `${((0.5 + ((x - cx) * 256 * ts) / width) * 100).toFixed(4)}%`;
      const topPct = `${((0.5 + ((y - cy) * 256 * ts) / height) * 100).toFixed(4)}%`;
      const tileVars = {
        '--tile-h': hPct,
        '--tile-left': leftPct,
        '--tile-top': topPct,
        '--tile-w': wPct,
      } as CSSProperties;
      tiles.push(
        <div data-active="true" data-map-tile="" key={`${x}-${y}-${tz}`} style={tileVars}>
          <img
            alt=""
            data-map-tile-img=""
            decoding="async"
            loading="lazy"
            src={url()}
            srcSet={tileSource.mode === 'offline' ? undefined : `${url(1)}, ${url(2)} 2x`}
          />
        </div>,
      );
    }
  }
  return tiles;
}
