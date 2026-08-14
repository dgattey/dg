/**
 * Seeds the proxy may rewrite to. Each one is prerendered, so a visit still
 * gets complete HTML and a cheap first paint. Rolling a brand-new uint32 on
 * every request would generate the bitmap on the hot path (~1.5s+ TTFB).
 */
export const FOREST_SEED_DECK: ReadonlyArray<number> = [
  20_260_812, 1, 7, 13, 42, 99, 100, 256, 512, 1024, 2048, 4096, 8191, 12_345, 424_242, 99_991,
];

export function rollForestSeed(): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const index = (bytes[0] || 1) % FOREST_SEED_DECK.length;
  return FOREST_SEED_DECK[index] ?? FOREST_SEED_DECK[0] ?? 20_260_812;
}
