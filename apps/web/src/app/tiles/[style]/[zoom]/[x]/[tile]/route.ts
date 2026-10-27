import 'server-only';

import { getTileSource } from '@dg/maps/src/getTileSource';
import { offlineTileSvg } from '@dg/maps/src/offlineTile';

type RouteContext = {
  params: Promise<{ style: string; tile: string; x: string; zoom: string }>;
};

const TILE_NAME = /^(\d+)(@2x)?\.(?:png|jpg)$/;
const INTEGER = /^\d+$/;

/** Serves `MAP_TILES=offline` tiles at Stadia's own paths, so offline maps exercise the real tile path. */
export async function GET(_request: Request, context: RouteContext) {
  const { style, tile, x, zoom } = await context.params;
  const match = TILE_NAME.exec(tile);
  if (getTileSource().mode !== 'offline' || !match || !INTEGER.test(x) || !INTEGER.test(zoom)) {
    return new Response('Not Found\n', { status: 404 });
  }
  const svg = offlineTileSvg({
    retina: match[2] !== undefined,
    style,
    x: Number(x),
    y: Number(match[1]),
    zoom: Number(zoom),
  });
  return new Response(svg, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'image/svg+xml',
    },
  });
}
