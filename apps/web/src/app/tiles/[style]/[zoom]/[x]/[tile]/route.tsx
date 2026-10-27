import 'server-only';

import { getTileSource } from '@dg/maps/src/getTileSource';
import { offlineTile } from '@dg/maps/src/offlineTile';
import { ImageResponse } from 'next/og';

type RouteContext = {
  params: Promise<{ style: string; tile: string; x: string; zoom: string }>;
};

const TILE_NAME = /^(\d+)(@2x)?\.(?:png|jpg)$/;
const INTEGER = /^\d+$/;
const TILE_PX = 256;

/**
 * Serves `MAP_TILES=offline` tiles at Stadia's own paths as raster PNGs, so
 * offline maps exercise the real tile path, including off-thread image decode.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { style, tile, x, zoom } = await context.params;
  const match = TILE_NAME.exec(tile);
  if (getTileSource().mode !== 'offline' || !match || !INTEGER.test(x) || !INTEGER.test(zoom)) {
    return new Response('Not Found\n', { status: 404 });
  }
  const retina = match[2] !== undefined;
  const size = retina ? TILE_PX * 2 : TILE_PX;
  const { art, ink, labels } = offlineTile({
    retina,
    style,
    x: Number(x),
    y: Number(match[1]),
    zoom: Number(zoom),
  });
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        color: ink,
        display: 'flex',
        flexDirection: 'column',
        fontSize: size / 9,
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <img
        alt=""
        height={size}
        src={`data:image/svg+xml,${encodeURIComponent(art)}`}
        style={{ left: 0, position: 'absolute', top: 0 }}
        width={size}
      />
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>,
    { headers: { 'Cache-Control': 'public, max-age=86400' }, height: size, width: size },
  );
}
