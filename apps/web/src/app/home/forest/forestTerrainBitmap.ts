import 'server-only';

import { deflateSync } from 'node:zlib';
import type { ForestWorld, TerrainFields, TerrainKind } from './forestMap';
import { sampleTerrainFields, visualTerrainAt } from './forestMap';
import { TERRAIN_DETAIL_HSL, TERRAIN_HSL } from './forestPalette';

/**
 * One painted bitmap of the island, generated on the server so the page
 * paints a single image instead of thousands of SVG rects.
 *
 * RGB PNG of a continuous height/moisture field — every pixel is a lerp, never
 * a nearest-biome index. The shoreline silhouette is a separate vector path
 * (`forestShore.ts`); this file only needs to be fine enough for bilinear
 * upscale of a gradient. Light and dark palettes are cached files.
 */

/** Collision stays 48px. Three samples per tile is enough once colour is continuous. */
export const BITMAP_PX_PER_TILE = 3;

/** Water mask only needs a soft silhouette for CSS waves. */
export const WATER_MASK_PX_PER_TILE = 2;

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

function mixRgb(left: Rgb, right: Rgb, t: number): Rgb {
  const amount = Math.min(1, Math.max(0, t));
  return [
    Math.round(left[0] + (right[0] - left[0]) * amount),
    Math.round(left[1] + (right[1] - left[1]) * amount),
    Math.round(left[2] + (right[2] - left[2]) * amount),
  ];
}

function paletteFor(scheme: 'dark' | 'light'): Array<Rgb> {
  const terrain = TERRAIN_HSL[scheme];
  const detail = TERRAIN_DETAIL_HSL[scheme];
  const colors: Array<Rgb> = Array.from({ length: PALETTE_SIZE }, () => [0, 0, 0] as Rgb);
  (Object.keys(TERRAIN_INDEX) as Array<TerrainKind>).forEach((kind) => {
    const hsl = terrain[kind];
    colors[TERRAIN_INDEX[kind]] = hslToRgb(hsl[0], hsl[1], hsl[2]);
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

export function encodeIndexedPngBytes(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: ReadonlyArray<Rgb>,
  transparentIndex?: number,
): Buffer {
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
  return Buffer.from(concat(parts));
}

export function encodeIndexedPng(
  width: number,
  height: number,
  pixels: Uint8Array,
  palette: ReadonlyArray<Rgb>,
  transparentIndex?: number,
): string {
  return `data:image/png;base64,${encodeIndexedPngBytes(width, height, pixels, palette, transparentIndex).toString('base64')}`;
}

function paethPredictor(left: number, above: number, upperLeft: number): number {
  const estimate = left + above - upperLeft;
  const toLeft = Math.abs(estimate - left);
  const toAbove = Math.abs(estimate - above);
  const toCorner = Math.abs(estimate - upperLeft);
  if (toLeft <= toAbove && toLeft <= toCorner) {
    return left;
  }
  return toAbove <= toCorner ? above : upperLeft;
}

/** RGB PNG (no alpha). Ocean is painted opaque so the file stays small; the page floods the same colour behind it. */
export function encodeRgbPngBytes(width: number, height: number, pixels: Uint8Array): Buffer {
  const ihdr = concat([u32(width), u32(height), Uint8Array.of(8, 2, 0, 0, 0)]);
  const stride = width * 3;
  const scanlines = new Uint8Array(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    scanlines[rowStart] = 4;
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const left = i >= 3 ? (row[i - 3] ?? 0) : 0;
      const above = prev?.[i] ?? 0;
      const upperLeft = i >= 3 ? (prev?.[i - 3] ?? 0) : 0;
      scanlines[rowStart + 1 + i] = ((row[i] ?? 0) - paethPredictor(left, above, upperLeft)) & 255;
    }
  }
  return Buffer.from(
    concat([
      Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(scanlines, { level: 9 })),
      chunk('IEND', new Uint8Array()),
    ]),
  );
}

function fieldRgb(fields: TerrainFields, colors: ReadonlyArray<Rgb>): Rgb {
  const grass = colors[TERRAIN_INDEX.grass] ?? [0, 0, 0];
  const meadow = colors[TERRAIN_INDEX.meadow] ?? grass;
  const wetland = colors[TERRAIN_INDEX.wetland] ?? grass;
  const land = mixRgb(grass, meadow, fields.meadowMix);
  return mixRgb(land, wetland, Math.min(1, fields.lakeShore * 0.35 + fields.riverShore * 0.2));
}

function paintTerrain(world: ForestWorld, scheme: 'dark' | 'light'): Uint8Array {
  const width = world.columns * BITMAP_PX_PER_TILE;
  const height = world.rows * BITMAP_PX_PER_TILE;
  const colors = paletteFor(scheme);
  const step = 1 / BITMAP_PX_PER_TILE;
  const pixels = new Uint8Array(width * height * 3);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const fx = (px + 0.5) * step;
      const fy = (py + 0.5) * step;
      const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
      const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
      const discrete = world.terrain[tileY]?.[tileX] ?? 'ocean';
      const fields = sampleTerrainFields(world, fx, fy);
      let pixel = fieldRgb(fields, colors);
      if (discrete === 'path' || discrete === 'trail' || discrete === 'clearing') {
        const route = colors[TERRAIN_INDEX[discrete]] ?? pixel;
        pixel = mixRgb(pixel, route, 0.72);
      } else if (discrete === 'bridge') {
        const plank =
          Math.floor(fx * 5) % 2 === 0
            ? (colors[DETAIL_PLANK] ?? colors[TERRAIN_INDEX.bridge])
            : (colors[TERRAIN_INDEX.bridge] ?? pixel);
        pixel = plank ?? pixel;
      } else if (discrete === 'mountain') {
        pixel = mixRgb(pixel, colors[TERRAIN_INDEX.mountain] ?? pixel, 0.8);
      } else if (discrete === 'hill') {
        pixel = mixRgb(pixel, colors[TERRAIN_INDEX.hill] ?? pixel, 0.65);
      }
      const offset = (py * width + px) * 3;
      pixels[offset] = pixel[0];
      pixels[offset + 1] = pixel[1];
      pixels[offset + 2] = pixel[2];
    }
  }
  return pixels;
}

export function forestTerrainSize(world: Pick<ForestWorld, 'columns' | 'rows'>) {
  return {
    height: world.rows * BITMAP_PX_PER_TILE,
    width: world.columns * BITMAP_PX_PER_TILE,
  };
}

export function forestTerrainPng(world: ForestWorld, scheme: 'dark' | 'light') {
  const { height, width } = forestTerrainSize(world);
  return encodeRgbPngBytes(width, height, paintTerrain(world, scheme));
}

export function forestTerrainDataUrls(world: ForestWorld) {
  const { height, width } = forestTerrainSize(world);
  return {
    dark: `data:image/png;base64,${forestTerrainPng(world, 'dark').toString('base64')}`,
    height,
    light: `data:image/png;base64,${forestTerrainPng(world, 'light').toString('base64')}`,
    width,
  };
}

export function forestWaterMaskPng(world: ForestWorld) {
  const width = world.columns * WATER_MASK_PX_PER_TILE;
  const height = world.rows * WATER_MASK_PX_PER_TILE;
  const pixels = new Uint8Array(width * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const kind = visualTerrainAt(
        world,
        (px + 0.5) / WATER_MASK_PX_PER_TILE,
        (py + 0.5) / WATER_MASK_PX_PER_TILE,
      );
      pixels[py * width + px] = kind === 'lake' || kind === 'ocean' || kind === 'shallow' ? 1 : 0;
    }
  }
  return encodeIndexedPngBytes(
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

export function forestWaterMaskDataUrl(world: ForestWorld) {
  return `data:image/png;base64,${forestWaterMaskPng(world).toString('base64')}`;
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
