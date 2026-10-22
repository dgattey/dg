import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

/**
 * Writes the collage paper grain: a 256px tile of fine light and dark specks.
 *
 * Every filter wraps around the tile edges, so pixel 0 neighbours pixel 255 and the
 * tile has no edge to see. A high-pass drops every lump wider than the fibre scale,
 * since a repeated lump is what makes a 256px grid show through the texture.
 */

const SIZE = 256;
const FIBRE_RADIUS = 1;
const FIBRE_WEIGHT = 0.4;
const LUMP_RADIUS = 2;
const MEAN_ALPHA = 5.7;
const MAX_ALPHA = 40;
const DARK_SPECK_STRENGTH = 0.4;

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const wrap = (i: number) => ((i % SIZE) + SIZE) % SIZE;

function boxBlur(field: Float64Array, radius: number): Float64Array {
  const span = radius * 2 + 1;
  const horizontal = new Float64Array(field.length);
  const out = new Float64Array(field.length);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        sum += field[y * SIZE + wrap(x + d)] ?? 0;
      }
      horizontal[y * SIZE + x] = sum / span;
    }
  }
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        sum += horizontal[wrap(y + d) * SIZE + x] ?? 0;
      }
      out[y * SIZE + x] = sum / span;
    }
  }
  return out;
}

function grainField(): Float64Array {
  const random = mulberry32(20261022);
  const noise = Float64Array.from(
    { length: SIZE * SIZE },
    () => random() + random() + random() - 1.5,
  );
  const fibre = boxBlur(noise, FIBRE_RADIUS);
  const grit = noise.map((value, i) => value + FIBRE_WEIGHT * (fibre[i] ?? 0));
  const lumps = boxBlur(boxBlur(grit, LUMP_RADIUS), LUMP_RADIUS);
  return grit.map((value, i) => value - (lumps[i] ?? 0));
}

/** Palette index per pixel: entries 0..MAX_ALPHA are dark specks, the rest light ones. */
function quantize(field: Float64Array): Uint8Array {
  const weight = (v: number) => (v > 0 ? v : -v * DARK_SPECK_STRENGTH);
  const meanWeight = field.reduce((sum, v) => sum + weight(v), 0) / field.length;
  const scale = MEAN_ALPHA / meanWeight;
  return Uint8Array.from(field, (v) => {
    const alpha = Math.min(MAX_ALPHA, Math.round(weight(v) * scale));
    return v > 0 ? MAX_ALPHA + 1 + alpha : alpha;
  });
}

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(indices: Uint8Array): Buffer {
  const entries = MAX_ALPHA + 1;
  const palette = Buffer.alloc(entries * 2 * 3);
  palette.fill(255, entries * 3);
  const transparency = Buffer.from(Array.from({ length: entries * 2 }, (_, i) => i % entries));
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header.set([8, 3, 0, 0, 0], 8);
  const rows = Buffer.alloc(SIZE * (SIZE + 1));
  for (let y = 0; y < SIZE; y++) {
    rows.set(indices.subarray(y * SIZE, (y + 1) * SIZE), y * (SIZE + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('PLTE', palette),
    chunk('tRNS', transparency),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const target = path.join(repoRoot, 'apps/web/src/app/collage/img/grain.png');
fs.writeFileSync(target, encodePng(quantize(grainField())));
process.stdout.write(`Wrote ${path.relative(repoRoot, target)}\n`);
