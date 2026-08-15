/**
 * Cached ground bitmaps, one URL per seed and layer.
 *
 * The page only emits these paths. The PNG lives at `/forest-ground/:seed/:layer`
 * so a 16-seed deck can reuse the same files across visits instead of inlining
 * a unique ~1.7 MB document each time.
 */

export const FOREST_GROUND_LAYERS = ['dark.png', 'light.png', 'water.png'] as const;

export type ForestGroundLayer = (typeof FOREST_GROUND_LAYERS)[number];

export function forestGroundPath(seed: number, layer: ForestGroundLayer) {
  return `/forest-ground/${seed}/${layer}`;
}

export function isForestGroundLayer(value: string): value is ForestGroundLayer {
  return (FOREST_GROUND_LAYERS as ReadonlyArray<string>).includes(value);
}
