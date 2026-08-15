import { FOREST_SEED_DECK } from '../../../../services/forestSeeds';
import { listForestCardIds } from '../../../home/forest/forestCards';
import { FOREST_GROUND_LAYERS, isForestGroundLayer } from '../../../home/forest/forestGround';
import { buildForestWorld, DEFAULT_FOREST_SEED } from '../../../home/forest/forestMap';
import { forestTerrainPng } from '../../../home/forest/forestTerrainBitmap';

export function generateStaticParams() {
  return FOREST_SEED_DECK.flatMap((seed) =>
    FOREST_GROUND_LAYERS.map((layer) => ({ layer, seed: String(seed) })),
  );
}

function parseSeed(raw: string): number {
  if (!/^\d+$/.test(raw)) {
    return DEFAULT_FOREST_SEED;
  }
  const parsed = Number.parseInt(raw, 10) >>> 0;
  return FOREST_SEED_DECK.includes(parsed) ? parsed : DEFAULT_FOREST_SEED;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ layer: string; seed: string }> },
) {
  const { layer, seed: rawSeed } = await context.params;
  if (!isForestGroundLayer(layer)) {
    return new Response(null, { status: 404 });
  }
  const seed = parseSeed(rawSeed);
  const world = buildForestWorld(await listForestCardIds(), seed);
  const body = forestTerrainPng(world, layer === 'dark.png' ? 'dark' : 'light');
  return new Response(Uint8Array.from(body), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  });
}
