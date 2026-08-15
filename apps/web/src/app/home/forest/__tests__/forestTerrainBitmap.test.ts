import { buildForestWorld } from '../forestMap';
import {
  BITMAP_PX_PER_TILE,
  encodeIndexedPng,
  forestMinimapDataUrls,
  forestTerrainDataUrls,
  forestTerrainPng,
  forestWaterMaskPng,
} from '../forestTerrainBitmap';

const pngBytes = (dataUrl: string) => {
  const encoded = dataUrl.replace('data:image/png;base64,', '');
  return Buffer.from(encoded, 'base64');
};

describe('forest terrain bitmap', () => {
  it('encodes a valid indexed PNG', () => {
    const dataUrl = encodeIndexedPng(2, 2, Uint8Array.of(0, 1, 1, 0), [
      [0, 0, 0],
      [255, 255, 255],
    ]);
    const bytes = pngBytes(dataUrl);
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });

  it('paints the island as one image per scheme, not a rect per tile', () => {
    const world = buildForestWorld(['intro', 'map', 'spotify']);
    const terrain = forestTerrainDataUrls(world);
    expect(terrain.width).toBe(world.columns * BITMAP_PX_PER_TILE);
    expect(terrain.height).toBe(world.rows * BITMAP_PX_PER_TILE);
    expect(terrain.light.startsWith('data:image/png;base64,')).toBe(true);
    expect(terrain.dark.startsWith('data:image/png;base64,')).toBe(true);
    expect(terrain.light).not.toEqual(terrain.dark);
    expect(pngBytes(terrain.light).length).toBeLessThan(terrain.width * terrain.height * 3);
  });

  it('keeps a water mask and a minimap that match the world size', () => {
    const world = buildForestWorld(['intro', 'map']);
    const mask = forestWaterMaskPng(world);
    const minimap = forestMinimapDataUrls(world);
    expect(mask[0]).toBe(0x89);
    expect(minimap.width).toBe(world.columns);
    expect(minimap.height).toBe(world.rows);
  });

  it('keeps each ground layer small enough to ship as a cached file', () => {
    const world = buildForestWorld(['intro', 'map', 'spotify']);
    expect(forestTerrainPng(world, 'light').length).toBeLessThan(80_000);
    expect(forestWaterMaskPng(world).length).toBeLessThan(8_000);
  });

  it('ships the ground as an RGB PNG so coasts can blend', () => {
    const png = forestTerrainPng(buildForestWorld(['intro', 'map', 'spotify']), 'light');
    expect(png[25]).toBe(2);
  });
});
