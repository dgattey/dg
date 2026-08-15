import 'server-only';

import { deflateSync } from 'node:zlib';
import type { ForestWorld, TerrainFields, TerrainKind } from './forestMap';
import { sampleGroundGrainUnlocked, sampleTerrainFieldsUnlocked, withWorldSeed } from './forestMap';
import { TERRAIN_HSL } from './forestPalette';

/** Collision stays 48px. Two CSS pixels per sample. */
export const BITMAP_PX_PER_TILE = 24;

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
  const colors: Array<Rgb> = Array.from({ length: 16 }, () => [0, 0, 0] as Rgb);
  (Object.keys(TERRAIN_INDEX) as Array<TerrainKind>).forEach((kind) => {
    const hsl = terrain[kind];
    colors[TERRAIN_INDEX[kind]] = hslToRgb(hsl[0], hsl[1], hsl[2]);
  });
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
  parts.push(chunk('IDAT', deflateSync(scanlines, { level: 6 })));
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

export function encodeRgbaPngBytes(width: number, height: number, pixels: Uint8Array): Buffer {
  const ihdr = concat([u32(width), u32(height), Uint8Array.of(8, 6, 0, 0, 0)]);
  const stride = width * 4;
  const scanlines = new Uint8Array(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    scanlines[rowStart] = 2;
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      scanlines[rowStart + 1 + i] = ((row[i] ?? 0) - (prev?.[i] ?? 0)) & 255;
    }
  }
  return Buffer.from(
    concat([
      Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(scanlines, { level: 6 })),
      chunk('IEND', new Uint8Array()),
    ]),
  );
}

function clampByte(value: number) {
  return Math.min(255, Math.max(0, value));
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function ramp(value: number, start: number, end: number) {
  return smoothstep(Math.min(1, Math.max(0, (value - start) / (end - start))));
}

function fieldRgb(fields: TerrainFields, colors: ReadonlyArray<Rgb>): Rgb {
  const grass = colors[TERRAIN_INDEX.grass] ?? [0, 0, 0];
  const meadow = colors[TERRAIN_INDEX.meadow] ?? grass;
  const wetland = colors[TERRAIN_INDEX.wetland] ?? grass;
  const sand = colors[TERRAIN_INDEX.sand] ?? grass;
  const dirt = colors[TERRAIN_INDEX.path] ?? sand;
  const shallow = colors[TERRAIN_INDEX.shallow] ?? sand;
  const lake = colors[TERRAIN_INDEX.lake] ?? shallow;
  let land = mixRgb(grass, meadow, Math.min(1, fields.meadowMix * 1.2));
  const worn = Math.max(0, fields.meadowNoise - 0.58) * 1.15;
  land = mixRgb(land, dirt, Math.min(0.42, worn));
  land = mixRgb(land, sand, ramp(fields.island, 0.72, 0.94) * 0.92);
  const lakeWet = 1 - ramp(fields.lakeField, 0.82, 1.22);
  const riverWet = 1 - ramp(fields.river, fields.riverWidth, fields.riverWidth + 1.4);
  land = mixRgb(land, wetland, Math.min(1, lakeWet * 0.85 + riverWet * 0.65) * 0.55);
  const water = Math.max(
    1 - ramp(fields.lakeField, 0.55, 0.95),
    1 - ramp(fields.river, 0, fields.riverWidth + 0.15),
  );
  if (water > 0) {
    land = mixRgb(land, mixRgb(shallow, lake, water), water);
  }
  return land;
}

const ROUTE_KINDS: ReadonlySet<TerrainKind> = new Set(['bridge', 'clearing', 'path', 'trail']);

function interiorOceanMask(world: ForestWorld) {
  const { columns, rows } = world;
  const mark = new Uint8Array(columns * rows);
  const ring = 3;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let interior = 1;
      scan: for (let offsetY = -ring; offsetY <= ring; offsetY++) {
        for (let offsetX = -ring; offsetX <= ring; offsetX++) {
          if ((world.terrain[y + offsetY]?.[x + offsetX] ?? 'ocean') !== 'ocean') {
            interior = 0;
            break scan;
          }
        }
      }
      mark[y * columns + x] = interior;
    }
  }
  return mark;
}

function writePixel(pixels: Uint8Array, offset: number, pixel: Rgb, grain: number, alpha: number) {
  pixels[offset] = clampByte(pixel[0] + grain);
  pixels[offset + 1] = clampByte(pixel[1] + grain);
  pixels[offset + 2] = clampByte(pixel[2] + Math.round(grain * 0.7));
  pixels[offset + 3] = clampByte(alpha);
}

const FIELD_PX_PER_TILE = 8;
const FIELD_COMPS = 7;

function packFields(out: Float32Array, index: number, fields: TerrainFields, grain: number) {
  const offset = index * FIELD_COMPS;
  out[offset] = fields.island;
  out[offset + 1] = fields.lakeField;
  out[offset + 2] = fields.meadowMix;
  out[offset + 3] = fields.meadowNoise;
  out[offset + 4] = fields.river;
  out[offset + 5] = fields.riverWidth;
  out[offset + 6] = grain;
}

function lerpGrid(
  grid: Float32Array,
  i00: number,
  i10: number,
  i01: number,
  i11: number,
  comp: number,
  tx: number,
  ty: number,
) {
  const tl = grid[i00 + comp] ?? 0;
  const tr = grid[i10 + comp] ?? 0;
  const bl = grid[i01 + comp] ?? 0;
  const br = grid[i11 + comp] ?? 0;
  return tl + (tr - tl) * tx + (bl - tl) * ty + (br - tr - bl + tl) * tx * ty;
}

function groundRgb(
  fields: TerrainFields,
  colors: ReadonlyArray<Rgb>,
  kind: TerrainKind | undefined,
): Rgb {
  const land = fieldRgb(fields, colors);
  if (!kind || !ROUTE_KINDS.has(kind)) {
    return land;
  }
  return mixRgb(land, colors[TERRAIN_INDEX[kind]] ?? land, kind === 'clearing' ? 0.5 : 0.88);
}

function paintTerrain(world: ForestWorld, scheme: 'dark' | 'light'): Uint8Array {
  const width = world.columns * BITMAP_PX_PER_TILE;
  const height = world.rows * BITMAP_PX_PER_TILE;
  const fieldWidth = world.columns * FIELD_PX_PER_TILE;
  const fieldHeight = world.rows * FIELD_PX_PER_TILE;
  const colors = paletteFor(scheme);
  const ocean = colors[TERRAIN_INDEX.ocean] ?? [0, 0, 0];
  const step = 1 / BITMAP_PX_PER_TILE;
  const fieldStep = 1 / FIELD_PX_PER_TILE;
  const pixels = new Uint8Array(width * height * 4);
  const fieldGrid = new Float32Array(fieldWidth * fieldHeight * FIELD_COMPS);
  const skip = interiorOceanMask(world);
  const oceanFields: TerrainFields = {
    island: 1.2,
    lakeField: 2,
    lakeShore: 0,
    meadowBasin: 2,
    meadowMix: 0,
    meadowNoise: 0,
    river: 8,
    riverShore: 0,
    riverWidth: 1,
  };
  const sampled: TerrainFields = { ...oceanFields };
  return withWorldSeed(world.seed, () => {
    for (let fy = 0; fy < fieldHeight; fy++) {
      for (let fx = 0; fx < fieldWidth; fx++) {
        const wx = (fx + 0.5) * fieldStep;
        const wy = (fy + 0.5) * fieldStep;
        const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(wx)));
        const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(wy)));
        const fields = skip[tileY * world.columns + tileX]
          ? oceanFields
          : sampleTerrainFieldsUnlocked(world, wx, wy);
        packFields(
          fieldGrid,
          fy * fieldWidth + fx,
          fields,
          skip[tileY * world.columns + tileX] ? 0 : sampleGroundGrainUnlocked(wx, wy),
        );
      }
    }
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const fx = (px + 0.5) * step;
        const fy = (py + 0.5) * step;
        const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
        const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
        const tile = tileY * world.columns + tileX;
        const offset = (py * width + px) * 4;
        if (skip[tile]) {
          writePixel(pixels, offset, ocean, 0, 0);
          continue;
        }
        const gx = fx * FIELD_PX_PER_TILE - 0.5;
        const gy = fy * FIELD_PX_PER_TILE - 0.5;
        const x0 = Math.min(fieldWidth - 1, Math.max(0, Math.floor(gx)));
        const y0 = Math.min(fieldHeight - 1, Math.max(0, Math.floor(gy)));
        const x1 = Math.min(fieldWidth - 1, x0 + 1);
        const y1 = Math.min(fieldHeight - 1, y0 + 1);
        const tx = Math.min(1, Math.max(0, gx - x0));
        const ty = Math.min(1, Math.max(0, gy - y0));
        const i00 = (y0 * fieldWidth + x0) * FIELD_COMPS;
        const i10 = (y0 * fieldWidth + x1) * FIELD_COMPS;
        const i01 = (y1 * fieldWidth + x0) * FIELD_COMPS;
        const i11 = (y1 * fieldWidth + x1) * FIELD_COMPS;
        sampled.island = lerpGrid(fieldGrid, i00, i10, i01, i11, 0, tx, ty);
        sampled.lakeField = lerpGrid(fieldGrid, i00, i10, i01, i11, 1, tx, ty);
        sampled.meadowMix = lerpGrid(fieldGrid, i00, i10, i01, i11, 2, tx, ty);
        sampled.meadowNoise = lerpGrid(fieldGrid, i00, i10, i01, i11, 3, tx, ty);
        sampled.river = lerpGrid(fieldGrid, i00, i10, i01, i11, 4, tx, ty);
        sampled.riverWidth = lerpGrid(fieldGrid, i00, i10, i01, i11, 5, tx, ty);
        const grain = lerpGrid(fieldGrid, i00, i10, i01, i11, 6, tx, ty);
        const pixel = groundRgb(sampled, colors, world.terrain[tileY]?.[tileX]);
        const inlandWater = Math.max(
          1 - ramp(sampled.lakeField, 0.55, 0.95),
          1 - ramp(sampled.river, 0, sampled.riverWidth + 0.15),
        );
        const cover = Math.max(inlandWater, 1 - ramp(sampled.island, 0.94, 1.08));
        const alpha = Math.round(cover * 255);
        writePixel(pixels, offset, pixel, alpha < 8 ? 0 : grain, alpha);
      }
    }
    return pixels;
  });
}

export function forestTerrainSize(world: Pick<ForestWorld, 'columns' | 'rows'>) {
  return {
    height: world.rows * BITMAP_PX_PER_TILE,
    width: world.columns * BITMAP_PX_PER_TILE,
  };
}

export function forestTerrainPng(world: ForestWorld, scheme: 'dark' | 'light') {
  const { height, width } = forestTerrainSize(world);
  return encodeRgbaPngBytes(width, height, paintTerrain(world, scheme));
}

export function samplePaintedGround(
  world: ForestWorld,
  scheme: 'dark' | 'light',
  fx: number,
  fy: number,
): Rgb {
  const colors = paletteFor(scheme);
  return withWorldSeed(world.seed, () => {
    const tileX = Math.min(world.columns - 1, Math.max(0, Math.floor(fx)));
    const tileY = Math.min(world.rows - 1, Math.max(0, Math.floor(fy)));
    const pixel = groundRgb(
      sampleTerrainFieldsUnlocked(world, fx, fy),
      colors,
      world.terrain[tileY]?.[tileX],
    );
    const grain = sampleGroundGrainUnlocked(fx, fy);
    return [
      clampByte(pixel[0] + grain),
      clampByte(pixel[1] + grain),
      clampByte(pixel[2] + Math.round(grain * 0.7)),
    ];
  });
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
