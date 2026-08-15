import { Suspense } from 'react';
import { FOREST_SEED_DECK } from '../../../../services/forestSeeds';
import { ForestHomepage } from '../../../home/forest/ForestHomepage';
import { DEFAULT_FOREST_SEED } from '../../../home/forest/forestMap';
import { generateHomepageMetadata } from '../../../home/homepageMetadata';

export const generateMetadata = generateHomepageMetadata;

export function generateStaticParams() {
  return FOREST_SEED_DECK.map((seed) => ({ seed: String(seed) }));
}

function parseForestSeed(raw: string): number {
  if (!/^\d+$/.test(raw)) {
    return DEFAULT_FOREST_SEED;
  }
  const parsed = Number.parseInt(raw, 10) >>> 0;
  return FOREST_SEED_DECK.includes(parsed) ? parsed : DEFAULT_FOREST_SEED;
}

async function SeededIsland({ params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  return <ForestHomepage seed={parseForestSeed(seed)} />;
}

/**
 * One seeded island. The proxy rewrites `/` here with a seed from a
 * prerendered deck, so the HTML is complete for that map — no flag read, no
 * `connection()`. The Suspense fallback is an ocean wash, not a second copy
 * of the default island: shipping two full maps in every document was ~1.7 MB
 * and wrecked first paint. Direct hits are redirected home.
 */
function OceanFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: 'light-dark(hsl(196deg 58% 58%), hsl(196deg 64% 13%))',
        height: '100dvh',
      }}
    />
  );
}

export default function Page({ params }: { params: Promise<{ seed: string }> }) {
  return (
    <Suspense fallback={<OceanFallback />}>
      <SeededIsland params={params} />
    </Suspense>
  );
}
