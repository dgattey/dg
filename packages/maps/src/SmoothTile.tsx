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
}: RouteFrame & { dark: boolean; tileSource: TileSource }): ReactElement {
  const tz = Math.round(zoom);
  const ts = 2 ** (zoom - tz);
  const { x: px, y: py } = project(center);
  const cx = px * 2 ** tz;
  const cy = py * 2 ** tz;
  const minX = Math.max(Math.floor(cx - width / ts / 512), 0);
  const maxX = Math.min(Math.floor(cx + width / ts / 512), 2 ** tz - 1);
  const minY = Math.max(Math.floor(cy - height / ts / 512), 0);
  const maxY = Math.min(Math.floor(cy + height / ts / 512), 2 ** tz - 1);
  const tiles: Array<ReactElement> = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const col = x - minX;
      const row = y - minY;
      const url = (dpr?: number) => outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tz });
      const tileVars = {
        '--tile-h': '100%',
        '--tile-left': `${col * 100}%`,
        '--tile-top': `${row * 100}%`,
        '--tile-w': '100%',
      } as CSSProperties;
      tiles.push(
        <div data-active="true" data-map-tile="" key={`${col}-${row}`} style={tileVars}>
          <img
            alt=""
            data-map-tile-img=""
            decoding="async"
            loading="lazy"
            src={url()}
            srcSet={`${url(1)}, ${url(2)} 2x`}
          />
        </div>,
      );
    }
  }
  const lPct = ((0.5 + ((minX - cx) * 256 * ts) / width) * 100).toFixed(4);
  const tPct = ((0.5 + ((minY - cy) * 256 * ts) / height) * 100).toFixed(4);
  const sx = ((256 * ts) / width).toFixed(6);
  const sy = ((256 * ts) / height).toFixed(6);
  const boxVars = {
    '--box-transform': `translate3d(${lPct}%, ${tPct}%, 0px) scale(${sx}, ${sy})`,
  } as CSSProperties;
  return (
    <div data-atlas-tile-stage="">
      <div data-atlas-tile-box="" style={boxVars}>
        {tiles}
      </div>
    </div>
  );
}
