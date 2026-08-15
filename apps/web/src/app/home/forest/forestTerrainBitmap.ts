import 'server-only';

import { deflateSync } from 'node:zlib';
import type { ForestWorld, TerrainFields, TerrainKind } from './forestMap';
import { visualTerrainAt, visualTerrainSample } from './forestMap';
import { TERRAIN_DETAIL_HSL, TERRAIN_HSL } from './forestPalette';

/**
 * One painted bitmap of the island, generated on the server so the page
 * paints a single image instead of thousands of SVG rects.
 *
 * RGB PNG sampled only fine enough for the upscale to interpolate. Interior
 * tiles stay a flat colour; coasts and lake shores lerp the distance field so
 * a beach is a gradient, not a stair. Ocean is the same colour the page floods
 * behind the bitmap. Light and dark palettes are separate cached files,
 * swapped with `light-dark()`.
 */

/** Collision stays 48px. Edges sample at 8px; interiors stay one colour so the file does not grow with the whole island. */
export const BITMAP_PX_PER_TILE = 8;

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
  const ocean = colors[TERRAIN_INDEX.ocean] ?? [0, 0, 0];
  const shallow = colors[TERRAIN_INDEX.shallow] ?? ocean;
  const sand = colors[TERRAIN_INDEX.sand] ?? ocean;
  const grass = colors[TERRAIN_INDEX.grass] ?? ocean;
  const meadow = colors[TERRAIN_INDEX.meadow] ?? grass;
  const lake = colors[TERRAIN_INDEX.lake] ?? shallow;
  const wetland = colors[TERRAIN_INDEX.wetland] ?? grass;
  const land = mixRgb(grass, meadow, fields.meadowMix);

  if (fields.island > 1.06) {
    return mixRgb(shallow, ocean, Math.min(1, (fields.island - 1.06) / 0.16));
  }
  if (fields.island > 0.96) {
    return mixRgb(sand, shallow, (fields.island - 0.96) / 0.1);
  }
  if (fields.island > 0.8) {
    return mixRgb(land, sand, (fields.island - 0.8) / 0.16);
  }
  if (fields.lakeField < 0.88) {
    return mixRgb(lake, shallow, (fields.lakeField / 0.88) * 0.35);
  }
  if (fields.lakeField < 1.22) {
    const shore = mixRgb(wetland, shallow, fields.lakeShore);
    return mixRgb(shore, land, (fields.lakeField - 0.88) / 0.34);
  }
  if (fields.river < fields.riverWidth) {
    return mixRgb(lake, shallow, (fields.river / Math.max(0.2, fields.riverWidth)) * 0.4);
  }
  if (fields.river < fields.riverWidth + 1.4) {
    const shore = mixRgb(wetland, shallow, fields.riverShore);
    return mixRgb(shore, land, (fields.river - fields.riverWidth) / 1.4);
  }
  return land;
}

const SOFT_BORDER_KINDS: ReadonlySet<TerrainKind> = new Set([
  'lake',
  'ocean',
  'sand',
  'shallow',
  'wetland',
]);

function finePaintTiles(world: ForestWorld): Array<Array<boolean>> {
  const edge = world.terrain.map((row, y) =>
    row.map((kind, x) => {
      if (!SOFT_BORDER_KINDS.has(kind)) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighbor = world.terrain[y + dy]?.[x + dx];
            if (neighbor !== undefined && SOFT_BORDER_KINDS.has(neighbor)) {
              return true;
            }
          }
        }
        return false;
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const neighbor = world.terrain[y + dy]?.[x + dx];
          if (neighbor !== undefined && neighbor !== kind) {
            return true;
          }
        }
      }
      return false;
    }),
  );
  return edge.map((row, y) =>
    row.map((isEdge, x) => {
      if (isEdge) {
        return true;
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (edge[y + dy]?.[x + dx]) {
            return true;
          }
        }
      }
      return false;
    }),
  );
}

function paintTerrain(world: ForestWorld, scheme: 'dark' | 'light'): Uint8Array {
  const width = world.columns * BITMAP_PX_PER_TILE;
  const height = world.rows * BITMAP_PX_PER_TILE;
  const colors = paletteFor(scheme);
  const step = 1 / BITMAP_PX_PER_TILE;
  const fine = finePaintTiles(world);
  const pixels = new Uint8Array(width * height * 3);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const fx = (px + 0.5) * step;
      const fy = (py + 0.5) * step;
      const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
      const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
      if (!fine[tileY]?.[tileX]) {
        const kind = world.terrain[tileY]?.[tileX] ?? 'ocean';
        const solid = colors[TERRAIN_INDEX[kind]] ?? [0, 0, 0];
        const offset = (py * width + px) * 3;
        pixels[offset] = solid[0];
        pixels[offset + 1] = solid[1];
        pixels[offset + 2] = solid[2];
        continue;
      }
      const sample = visualTerrainSample(world, fx, fy);
      const needsNorth = sample.kind === 'hill' || sample.kind === 'mountain';
      const north =
        needsNorth && py > 0 ? visualTerrainSample(world, fx, fy - step).kind : sample.kind;
      let pixel: Rgb;
      if (sample.route || !sample.fields) {
        const plank =
          sample.kind === 'bridge' && Math.floor(fx * 5) % 2 === 0
            ? (colors[DETAIL_PLANK] ?? colors[TERRAIN_INDEX.bridge])
            : (colors[TERRAIN_INDEX[sample.kind]] ?? colors[0]);
        pixel = plank ?? [0, 0, 0];
      } else if (sample.kind === 'mountain') {
        pixel = (north !== 'mountain' ? colors[DETAIL_CAP] : colors[TERRAIN_INDEX.mountain]) ?? [
          0, 0, 0,
        ];
      } else if (sample.kind === 'hill') {
        pixel = (north === 'mountain' ? colors[DETAIL_RIDGE] : colors[TERRAIN_INDEX.hill]) ?? [
          0, 0, 0,
        ];
      } else {
        pixel = fieldRgb(sample.fields, colors);
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
