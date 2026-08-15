import { buildForestWorld, sampleGroundGrain } from '../forestMap';
import {
  BITMAP_PX_PER_TILE,
  encodeIndexedPng,
  forestMinimapDataUrls,
  forestTerrainPng,
  forestTerrainSize,
  forestWaterMaskPng,
  nearestRibbon,
  samplePaintedGround,
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

  it('paints a continuous field and ships it as a compact indexed PNG', () => {
    const world = buildForestWorld(['intro', 'map', 'spotify']);
    const size = forestTerrainSize(world);
    const png = forestTerrainPng(world, 'light');
    expect(size.width).toBe(world.columns * BITMAP_PX_PER_TILE);
    expect(size.height).toBe(world.rows * BITMAP_PX_PER_TILE);
    expect(png[25]).toBe(2);
    expect(png.length).toBeLessThan(480_000);
    expect(samplePaintedGround(world, 'light', 22.4, 31.2)).not.toEqual(
      samplePaintedGround(world, 'dark', 22.4, 31.2),
    );
  });

  it('keeps a water mask and a minimap that match the world size', () => {
    const world = buildForestWorld(['intro', 'map']);
    const mask = forestWaterMaskPng(world);
    const minimap = forestMinimapDataUrls(world);
    expect(mask[0]).toBe(0x89);
    expect(minimap.width).toBe(world.columns);
    expect(minimap.height).toBe(world.rows);
  });

  it('keeps the water mask tiny', () => {
    expect(forestWaterMaskPng(buildForestWorld(['intro', 'map', 'spotify'])).length).toBeLessThan(
      8_000,
    );
  });

  it('samples the ground finer than a tile so 1440 does not show a pixel grid', () => {
    expect(BITMAP_PX_PER_TILE).toBeGreaterThanOrEqual(12);
  });

  it('grains the grass with value noise, not a repeating block', () => {
    const world = { seed: 20_260_812 };
    const a = sampleGroundGrain(world, 10.0, 12.0);
    const b = sampleGroundGrain(world, 10.15, 12.0);
    const c = sampleGroundGrain(world, 10.0, 12.15);
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(Math.abs(a - b)).toBeLessThan(8);
  });

  it('lerps two points inside the same grass tile instead of stamping one colour', () => {
    const world = buildForestWorld(['intro', 'map', 'spotify']);
    let tileX = 0;
    let tileY = 0;
    outer: for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.columns; x++) {
        if (world.terrain[y]?.[x] === 'grass') {
          tileX = x;
          tileY = y;
          break outer;
        }
      }
    }
    const a = samplePaintedGround(world, 'light', tileX + 0.2, tileY + 0.2);
    const b = samplePaintedGround(world, 'light', tileX + 0.8, tileY + 0.7);
    expect(a).not.toEqual(b);
  });

  it('treats a path as a ribbon, not a hard tile stamp', () => {
    const world = buildForestWorld(['intro', 'map', 'spotify']);
    let pathX = 0;
    let pathY = 0;
    outer: for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.columns; x++) {
        if (world.terrain[y]?.[x] === 'path') {
          pathX = x;
          pathY = y;
          break outer;
        }
      }
    }
    const kinds = new Set<'bridge' | 'clearing' | 'path' | 'trail'>([
      'bridge',
      'clearing',
      'path',
      'trail',
    ]);
    const onPath = nearestRibbon(world, pathX + 0.5, pathY + 0.5, kinds);
    const offPath = nearestRibbon(world, 0.5, 0.5, kinds);
    expect(onPath?.dist).toBeLessThan(0);
    expect(offPath === null || offPath.dist > 0.8).toBe(true);
  });
});
