import 'server-only';

import { deflateSync } from 'node:zlib';
import type { ForestWorld, TerrainKind } from './forestMap';
import { visualTerrainAt } from './forestMap';
import { TERRAIN_DETAIL_HSL, TERRAIN_HSL } from './forestPalette';

/**
 * One painted bitmap of the island, generated on the server so the page
 * paints a single image instead of thousands of SVG rects.
 *
 * Indexed PNG sampled finer than a walkable tile, ocean as transparency (the
 * page already floods that colour), light and dark palettes swapped with
 * `light-dark()` so the theme toggle still works without JavaScript. The
 * bitmap is upscaled with ordinary interpolation so biome edges blend instead
 * of printing the 48px collision grid.
 */

export const BITMAP_PX_PER_TILE = 8;

const TERRAIN_INDEX: Record<TerrainKind, number> = {
  bridge: 11,
  clearing: 12,
  grass: 4,
  hill: 7,
  lake: 2,
  meadow: 5,
  mountain: 8,
  ocean: 0,
  path: 9,
  sand: 3,
  shallow: 1,
  trail: 10,
  wetland: 6,
};

const DETAIL_CAP = 13;
const DETAIL_RIDGE = 14;
const DETAIL_PLANK = 15;
const PALETTE_SIZE = 16;

type Rgb = readonly [number, number, number];

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sat = s / 100;
  const lit = l / 100;
  const a = sat * Math.min(lit, 1 - lit);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return lit - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(channel(0) * 255), Math.round(channel(8) * 255), Math.round(channel(4) * 255)];
}

function paletteFor(scheme: 'dark' | 'light'): Array<Rgb> {
  const terrain = TERRAIN_HSL[scheme];
  const detail = TERRAIN_DETAIL_HSL[scheme];
  const colors: Array<Rgb> = Array.from({ length: PALETTE_SIZE }, () => [0, 0, 0]);
  (Object.keys(TERRAIN_INDEX) as Array<TerrainKind>).forEach((kind) => {
    const hsl = terrain[kind];
    const index = TERRAIN_INDEX[kind];
    colors[index] = hslToRgb(hsl[0], hsl[1], hsl[2]);
  });
  colors[DETAIL_CAP] = hslToRgb(detail.cap[0], detail.cap[1], detail.cap[2]);
  colors[DETAIL_RIDGE] = hslToRgb(detail.ridge[0], detail.ridge[1], detail.ridge[2]);
  colors[DETAIL_PLANK] = hslToRgb(detail.plank[0], detail.plank[1], detail.plank[2]);
  return colors;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u32(value: number): Uint8Array {
  return Uint8Array.of(
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  );
}

function concat(parts: ReadonlyArray<Uint8Array>): Uint8Array {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = Uint8Array.from(type, (char) => char.charCodeAt(0));
  const crcInput = concat([typeBytes, data]);
  return concat([u32(data.length), crcInput, u32(crc32(crcInput))]);
}

export function encodeIndexedPng(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: ReadonlyArray<Rgb>,
  transparentIndex?: number,
): string {
  const ihdr = concat([u32(width), u32(height), Uint8Array.of(8, 3, 0, 0, 0)]);
  const plte = new Uint8Array(palette.length * 3);
  palette.forEach((rgb, index) => {
    plte[index * 3] = rgb[0];
    plte[index * 3 + 1] = rgb[1];
    plte[index * 3 + 2] = rgb[2];
  });
  const scanlines = new Uint8Array(height * (width + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width + 1);
    scanlines[rowStart] = 0;
    scanlines.set(pixels.subarray(y * width, (y + 1) * width), rowStart + 1);
  }
  const parts = [
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
  ];
  if (transparentIndex !== undefined) {
    const trns = new Uint8Array(transparentIndex + 1);
    parts.push(chunk('tRNS', trns));
  }
  parts.push(chunk('IDAT', deflateSync(scanlines, { level: 9 })));
  parts.push(chunk('IEND', new Uint8Array()));
  return `data:image/png;base64,${Buffer.from(concat(parts)).toString('base64')}`;
}

function paintTerrain(world: ForestWorld): Uint8Array {
  const width = world.columns * BITMAP_PX_PER_TILE;
  const height = world.rows * BITMAP_PX_PER_TILE;
  const pixels = new Uint8Array(width * height);
  const step = 1 / BITMAP_PX_PER_TILE;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const fx = (px + 0.5) * step;
      const fy = (py + 0.5) * step;
      const kind = visualTerrainAt(world, fx, fy);
      const north = visualTerrainAt(world, fx, fy - step);
      let index = TERRAIN_INDEX[kind];
      if (kind === 'mountain' && north !== 'mountain') {
        index = DETAIL_CAP;
      } else if (kind === 'hill' && north === 'mountain') {
        index = DETAIL_RIDGE;
      } else if (kind === 'bridge' && Math.floor(fx * 5) % 2 === 0) {
        index = DETAIL_PLANK;
      }
      pixels[py * width + px] = index;
    }
  }
  return pixels;
}

export function forestTerrainDataUrls(world: ForestWorld) {
  const pixels = paintTerrain(world);
  const width = world.columns * BITMAP_PX_PER_TILE;
  const height = world.rows * BITMAP_PX_PER_TILE;
  return {
    dark: encodeIndexedPng(width, height, pixels, paletteFor('dark'), 0),
    height,
    light: encodeIndexedPng(width, height, pixels, paletteFor('light'), 0),
    width,
  };
}

export function forestWaterMaskDataUrl(world: ForestWorld) {
  const scale = 4;
  const width = world.columns * scale;
  const height = world.rows * scale;
  const pixels = new Uint8Array(width * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const kind = visualTerrainAt(world, (px + 0.5) / scale, (py + 0.5) / scale);
      pixels[py * width + px] = kind === 'lake' || kind === 'ocean' || kind === 'shallow' ? 1 : 0;
    }
  }
  return encodeIndexedPng(
    width,
    height,
    pixels,
    [
      [0, 0, 0],
      [255, 255, 255],
    ],
    0,
  );
}

export function forestMinimapDataUrls(world: Pick<ForestWorld, 'columns' | 'rows' | 'terrain'>) {
  const width = world.columns;
  const height = world.rows;
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels[y * width + x] = TERRAIN_INDEX[world.terrain[y]?.[x] ?? 'ocean'];
    }
  }
  return {
    dark: encodeIndexedPng(width, height, pixels, paletteFor('dark')),
    height,
    light: encodeIndexedPng(width, height, pixels, paletteFor('light')),
    width,
  };
}
