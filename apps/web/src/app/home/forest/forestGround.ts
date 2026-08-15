export const FOREST_GROUND_LAYERS = ['dark.png', 'light.png'] as const;

export type ForestGroundLayer = (typeof FOREST_GROUND_LAYERS)[number];

export function forestGroundPath(seed: number, layer: ForestGroundLayer) {
  return `/forest-ground/${seed}/${layer}`;
}

export function isForestGroundLayer(value: string): value is ForestGroundLayer {
  return (FOREST_GROUND_LAYERS as ReadonlyArray<string>).includes(value);
}
