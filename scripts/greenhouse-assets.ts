#!/usr/bin/env tsx
/**
 * Key, despill, and encode greenhouse rasters.
 *
 * Sources stay out of git (they are 1–3MB PNGs). Default directory:
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media
 *
 * Required dedicated sources:
 *   plant-src-edge-left.png, plant-src-edge-right.png (1024×1536)
 *   plant-src-bottom-band.png (1536×1024)
 *   spike-glass-plate.png (landscape), plate-src-portrait.png
 *
 * Despill is hue-limited so BOP orange and fittonia pink stay saturated.
 * Edges erode 1px. Bottom band is cropped to foliage rows, then checked
 * for a 40px wrap seam; a dirty seam is baked as a mirror tile.
 *
 * Emits:
 *   atmosphere/back-plate-1536, -960, and -768 (landscape)
 *   atmosphere/back-plate-portrait and -portrait-768
 *   foliage/edge-{left,right}-1536, -900, and -768 (height)
 *   foliage/bottom-band-1536, -1024, and -768 (width)
 *   foliage/{name}-1024 and -768 cutouts
 *
 * Usage (from repo root, sharp resolved via @dg/ui):
 *   pnpm --filter @dg/web exec tsx ../../scripts/greenhouse-assets.ts
 */
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function loadSharp() {
  const candidates = [
    join(repoRoot, 'packages/ui/node_modules/sharp'),
    join(repoRoot, 'node_modules/sharp'),
    join(repoRoot, 'apps/web/node_modules/sharp'),
    'sharp',
  ];
  for (const id of candidates) {
    try {
      return require(id) as typeof import('sharp');
    } catch {
      // try next
    }
  }
  throw new Error('sharp is not installed. Run pnpm install, then retry.');
}

const sharp = loadSharp();

const DEFAULT_SRC_DIR = '/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media';

const PLANTS = ['monstera', 'bop', 'calathea', 'nerve'] as const;

const KEY_THRESHOLD = 42;
const KEY_SOFT = 28;
const SPILL_RB_DELTA = 36;
const SPILL_OVER_G = 22;

type Rgba = { data: Buffer; width: number; height: number };

function magentaAmount(r: number, g: number, b: number): number {
  return Math.min(r, b) - g;
}

function isMagentaHue(r: number, g: number, b: number): boolean {
  return Math.abs(r - b) <= SPILL_RB_DELTA && Math.min(r, b) > g + SPILL_OVER_G;
}

function keyAndDespill(raw: Rgba): Rgba {
  const { data, width, height } = raw;
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const amount = magentaAmount(r, g, b);
    const keyed = Math.max(0, Math.min(1, (amount - KEY_THRESHOLD) / KEY_SOFT));
    const alpha = Math.round((1 - keyed) * 255);
    out[i + 3] = Math.min(out[i + 3], alpha);

    if (out[i + 3] > 0 && isMagentaHue(r, g, b)) {
      const spill = Math.min(r, b) - g;
      out[i] = Math.max(0, r - Math.round(spill * 0.85));
      out[i + 2] = Math.max(0, b - Math.round(spill * 0.85));
    }
  }

  return { data: out, height, width };
}

function erodeAlpha(raw: Rgba, radius = 1): Rgba {
  const { data, width, height } = raw;
  const out = Buffer.from(data);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) {
        continue;
      }
      let minA = data[i + 3];
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            minA = 0;
            continue;
          }
          minA = Math.min(minA, data[(ny * width + nx) * 4 + 3]);
        }
      }
      out[i + 3] = minA;
    }
  }
  return { data: out, height, width };
}

function featherAlpha(raw: Rgba): Rgba {
  const { data, width, height } = raw;
  const out = Buffer.from(data);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4;
      const a =
        data[i + 3] * 4 +
        data[i - 1] +
        data[i + 7] +
        data[i - width * 4 + 3] +
        data[i + width * 4 + 3];
      out[i + 3] = Math.round(a / 8);
    }
  }
  return { data: out, height, width };
}

function prepareKeyed(raw: Rgba): Rgba {
  return featherAlpha(erodeAlpha(keyAndDespill(raw), 1));
}

async function rawFromSharp(image: import('sharp').Sharp): Promise<Rgba> {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) {
    throw new Error(`expected RGBA, got ${info.channels}`);
  }
  return { data, height: info.height, width: info.width };
}

async function encodeKeyedHeight(
  raw: Rgba,
  height: number,
  outBase: string,
  targetKb = 65,
): Promise<void> {
  const pipeline = () =>
    sharp(raw.data, { raw: { channels: 4, height: raw.height, width: raw.width } }).resize({
      fit: 'inside',
      height,
    });

  let quality = 35;
  let avif = await pipeline().avif({ chromaSubsampling: '4:2:0', effort: 7, quality }).toBuffer();
  while (avif.length > targetKb * 1024 && quality > 28) {
    quality -= 1;
    avif = await pipeline().avif({ chromaSubsampling: '4:2:0', effort: 7, quality }).toBuffer();
  }
  const webp = await pipeline().webp({ alphaQuality: 80, quality: 62 }).toBuffer();
  writeFileSync(`${outBase}.avif`, avif);
  writeFileSync(`${outBase}.webp`, webp);
  process.stdout.write(
    `  ${outBase.split('/').at(-1)}  avif ${(avif.length / 1024).toFixed(1)}KB q${quality}  webp ${(webp.length / 1024).toFixed(1)}KB\n`,
  );
}

async function encodeKeyedWidth(raw: Rgba, width: number, outBase: string): Promise<void> {
  const pipeline = () =>
    sharp(raw.data, { raw: { channels: 4, height: raw.height, width: raw.width } }).resize(
      width,
      null,
      { fit: 'inside', withoutEnlargement: true },
    );

  const avif = await pipeline()
    .avif({ chromaSubsampling: '4:4:4', effort: 7, quality: 40 })
    .toBuffer();
  const webp = await pipeline().webp({ alphaQuality: 80, quality: 65 }).toBuffer();
  writeFileSync(`${outBase}.avif`, avif);
  writeFileSync(`${outBase}.webp`, webp);
  process.stdout.write(
    `  ${outBase.split('/').at(-1)}  avif ${(avif.length / 1024).toFixed(1)}KB  webp ${(webp.length / 1024).toFixed(1)}KB\n`,
  );
}

async function encodeRgbWidth(
  src: string,
  width: number,
  outBase: string,
  targetKb: { max: number; min: number },
): Promise<void> {
  const resized = sharp(src).resize(width, null, { fit: 'inside', withoutEnlargement: true });
  let quality = 38;
  let avif = await resized
    .clone()
    .avif({ chromaSubsampling: '4:2:0', effort: 7, quality })
    .toBuffer();
  while (avif.length > targetKb.max * 1024 && quality > 22) {
    quality -= 3;
    avif = await resized
      .clone()
      .avif({ chromaSubsampling: '4:2:0', effort: 7, quality })
      .toBuffer();
  }
  while (avif.length < targetKb.min * 1024 && quality < 62) {
    quality += 2;
    avif = await resized
      .clone()
      .avif({ chromaSubsampling: '4:2:0', effort: 7, quality })
      .toBuffer();
    if (avif.length > targetKb.max * 1024) {
      quality -= 2;
      avif = await resized
        .clone()
        .avif({ chromaSubsampling: '4:2:0', effort: 7, quality })
        .toBuffer();
      break;
    }
  }
  const webp = await resized.clone().webp({ quality: 62 }).toBuffer();
  writeFileSync(`${outBase}.avif`, avif);
  writeFileSync(`${outBase}.webp`, webp);
  process.stdout.write(
    `  ${outBase.split('/').at(-1)}  avif ${(avif.length / 1024).toFixed(1)}KB q${quality}  webp ${(webp.length / 1024).toFixed(1)}KB\n`,
  );
}

function unlinkQuiet(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // already gone
  }
}

function requireSrc(srcDir: string, name: string): string {
  const path = join(srcDir, name);
  if (!existsSync(path)) {
    throw new Error(`missing source ${path}`);
  }
  return path;
}

async function encodeBackPlates(srcDir: string, outDir: string): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  process.stdout.write('back-plate\n');
  await encodeRgbWidth(
    requireSrc(srcDir, 'spike-glass-plate.png'),
    1536,
    join(outDir, 'back-plate-1536'),
    {
      max: 110,
      min: 90,
    },
  );
  await encodeRgbWidth(
    requireSrc(srcDir, 'spike-glass-plate.png'),
    960,
    join(outDir, 'back-plate-960'),
    {
      max: 72,
      min: 50,
    },
  );
  await encodeRgbWidth(
    requireSrc(srcDir, 'spike-glass-plate.png'),
    768,
    join(outDir, 'back-plate-768'),
    {
      max: 48,
      min: 28,
    },
  );
  await encodeRgbWidth(
    requireSrc(srcDir, 'plate-src-portrait.png'),
    1024,
    join(outDir, 'back-plate-portrait'),
    { max: 90, min: 50 },
  );
  await encodeRgbWidth(
    requireSrc(srcDir, 'plate-src-portrait.png'),
    768,
    join(outDir, 'back-plate-portrait-768'),
    { max: 56, min: 24 },
  );
  for (const stale of ['depth-plate.avif', 'depth-plate.webp']) {
    unlinkQuiet(join(outDir, stale));
  }
}

async function loadKeyedSource(src: string): Promise<Rgba> {
  return prepareKeyed(await rawFromSharp(sharp(src)));
}

/**
 * Soften a rectangular inner slab so the content-facing edge reads as a
 * silhouette. Wave the erode depth so the cut is not a second straight line.
 */
function erodeInnerSlab(raw: Rgba, side: 'left' | 'right'): Rgba {
  const { data, width, height } = raw;
  const out = Buffer.from(data);
  for (let y = 0; y < height; y += 1) {
    const wave =
      12 + 24 * (0.5 + 0.5 * Math.sin(y * 0.037)) + 16 * (0.5 + 0.5 * Math.sin(y * 0.091 + 1.2));
    const radius = Math.round(32 + wave);
    if (side === 'right') {
      let first = -1;
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 24) {
          first = x;
          break;
        }
      }
      if (first < 0) {
        continue;
      }
      for (let x = first; x < Math.min(width, first + radius); x += 1) {
        const t = (x - first) / radius;
        const i = (y * width + x) * 4 + 3;
        out[i] = Math.round(out[i] * t * t);
      }
    } else {
      let last = -1;
      for (let x = width - 1; x >= 0; x -= 1) {
        if (data[(y * width + x) * 4 + 3] > 24) {
          last = x;
          break;
        }
      }
      if (last < 0) {
        continue;
      }
      for (let x = last; x > Math.max(-1, last - radius); x -= 1) {
        const t = (last - x) / radius;
        const i = (y * width + x) * 4 + 3;
        out[i] = Math.round(out[i] * t * t);
      }
    }
  }
  return { data: out, height, width };
}

/** Keep the top silhouette of a keyed band so the dense mass is a peek, not a wall. */
function cropBandPeek(raw: Rgba, maxHeight = 168): Rgba {
  if (raw.height <= maxHeight) {
    return raw;
  }
  const data = Buffer.alloc(raw.width * maxHeight * 4);
  raw.data.copy(data, 0, 0, raw.width * maxHeight * 4);
  return { data, height: maxHeight, width: raw.width };
}

function cropFoliageRows(raw: Rgba, threshold = 24): Rgba {
  let top = 0;
  found: for (let y = 0; y < raw.height; y += 1) {
    for (let x = 0; x < raw.width; x += 1) {
      if (raw.data[(y * raw.width + x) * 4 + 3] > threshold) {
        top = Math.max(0, y - 2);
        break found;
      }
    }
  }
  const height = raw.height - top;
  const data = Buffer.alloc(raw.width * height * 4);
  raw.data.copy(data, 0, top * raw.width * 4);
  return { data, height, width: raw.width };
}

function seamMeanAbsDiff(raw: Rgba, cols = 40): number {
  const width = Math.min(cols, Math.floor(raw.width / 2));
  let sum = 0;
  let n = 0;
  for (let y = 0; y < raw.height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const left = (y * raw.width + x) * 4;
      const right = (y * raw.width + raw.width - width + x) * 4;
      sum += Math.abs(raw.data[left] - raw.data[right]);
      sum += Math.abs(raw.data[left + 1] - raw.data[right + 1]);
      sum += Math.abs(raw.data[left + 2] - raw.data[right + 2]);
      sum += Math.abs(raw.data[left + 3] - raw.data[right + 3]);
      n += 4;
    }
  }
  return n === 0 ? 0 : sum / n;
}

async function mirrorTile(raw: Rgba): Promise<Rgba> {
  const tile = await sharp(raw.data, {
    raw: { channels: 4, height: raw.height, width: raw.width },
  })
    .png()
    .toBuffer();
  const flipped = await sharp(tile).flop().png().toBuffer();
  const joined = await sharp({
    create: {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      channels: 4,
      height: raw.height,
      width: raw.width * 2,
    },
  })
    .composite([
      { input: tile, left: 0, top: 0 },
      { input: flipped, left: raw.width, top: 0 },
    ])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: joined.data, height: joined.info.height, width: joined.info.width };
}

async function encodeEdges(srcDir: string, outDir: string): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  for (const side of ['left', 'right'] as const) {
    const src = requireSrc(srcDir, `plant-src-edge-${side}.png`);
    process.stdout.write(`edge-${side} ${src}\n`);
    const keyed = erodeInnerSlab(await loadKeyedSource(src), side);
    await encodeKeyedHeight(keyed, 1536, join(outDir, `edge-${side}-1536`));
    await encodeKeyedHeight(keyed, 900, join(outDir, `edge-${side}-900`));
    await encodeKeyedHeight(keyed, 768, join(outDir, `edge-${side}-768`), 40);
  }
}

async function encodeBottomBand(srcDir: string, outDir: string): Promise<void> {
  const src = requireSrc(srcDir, 'plant-src-bottom-band.png');
  const keyed = cropBandPeek(cropFoliageRows(await loadKeyedSource(src)));
  const seam = seamMeanAbsDiff(keyed);
  const dirty = seam > 18;
  process.stdout.write(
    `bottom-band cropped ${keyed.width}×${keyed.height}  seam MAD ${seam.toFixed(1)}${dirty ? ' → mirror-tile' : ' (clean)'}\n`,
  );
  const tile = dirty ? await mirrorTile(keyed) : keyed;
  await encodeKeyedWidth(tile, 1536, join(outDir, 'bottom-band-1536'));
  await encodeKeyedWidth(tile, 1024, join(outDir, 'bottom-band-1024'));
  await encodeKeyedWidth(tile, 768, join(outDir, 'bottom-band-768'));
  for (const stale of ['bottom-band.avif', 'bottom-band.webp']) {
    unlinkQuiet(join(outDir, stale));
  }
}

async function processPlant(name: string, srcDir: string, outDir: string): Promise<void> {
  const src = join(srcDir, `plant-src-${name}.png`);
  const keyed = await loadKeyedSource(src);
  process.stdout.write(`${name} ${keyed.width}×${keyed.height}\n`);
  await encodeKeyedWidth(keyed, 1024, join(outDir, `${name}-1024`));
  await encodeKeyedWidth(keyed, 768, join(outDir, `${name}-768`));
}

/**
 * Re-key shipped encodes when the magenta PNG sources are not on disk.
 * Right strip: eat the inner slab. Band: keep a shallow peek tile.
 */
async function repairExistingFoliage(foliageDir: string): Promise<void> {
  const rightSrc = join(foliageDir, 'edge-right-1536.webp');
  if (!existsSync(rightSrc)) {
    throw new Error(`missing ${rightSrc}`);
  }
  process.stdout.write('repair edge-right inner slab from existing 1536 webp\n');
  const right = featherAlpha(erodeInnerSlab(await rawFromSharp(sharp(rightSrc)), 'right'));
  await encodeKeyedHeight(right, 1536, join(foliageDir, 'edge-right-1536'));
  await encodeKeyedHeight(right, 900, join(foliageDir, 'edge-right-900'));
  await encodeKeyedHeight(right, 768, join(foliageDir, 'edge-right-768'), 40);

  const bandSrc = join(foliageDir, 'bottom-band-1536.webp');
  if (!existsSync(bandSrc)) {
    throw new Error(`missing ${bandSrc}`);
  }
  process.stdout.write('repair bottom-band peek from existing 1536 webp\n');
  const band = cropBandPeek(await rawFromSharp(sharp(bandSrc)));
  await encodeKeyedWidth(band, 1536, join(foliageDir, 'bottom-band-1536'));
  await encodeKeyedWidth(band, 1024, join(foliageDir, 'bottom-band-1024'));
  await encodeKeyedWidth(band, 768, join(foliageDir, 'bottom-band-768'));
}

async function encodeOneXFromExisting(atmosphereDir: string, foliageDir: string): Promise<void> {
  process.stdout.write('1x ladder from existing 2x encodes\n');
  const jobs: Array<{ src: string; width?: number; height?: number; out: string }> = [
    {
      out: join(atmosphereDir, 'back-plate-768'),
      src: join(atmosphereDir, 'back-plate-1536.webp'),
      width: 768,
    },
    {
      out: join(atmosphereDir, 'back-plate-portrait-768'),
      src: join(atmosphereDir, 'back-plate-portrait.webp'),
      width: 768,
    },
    {
      height: 768,
      out: join(foliageDir, 'edge-left-768'),
      src: join(foliageDir, 'edge-left-1536.webp'),
    },
    {
      height: 768,
      out: join(foliageDir, 'edge-right-768'),
      src: join(foliageDir, 'edge-right-1536.webp'),
    },
    {
      out: join(foliageDir, 'bottom-band-768'),
      src: join(foliageDir, 'bottom-band-1536.webp'),
      width: 768,
    },
  ];
  for (const job of jobs) {
    if (!existsSync(job.src)) {
      throw new Error(`missing ${job.src}`);
    }
    const pipeline = sharp(job.src).resize({
      ...(job.width ? { width: job.width } : { height: job.height }),
      fit: 'inside',
      withoutEnlargement: true,
    });
    const avif = await pipeline
      .clone()
      .avif({ chromaSubsampling: '4:2:0', effort: 6, quality: 36 })
      .toBuffer();
    const webp = await pipeline.clone().webp({ alphaQuality: 80, quality: 62 }).toBuffer();
    writeFileSync(`${job.out}.avif`, avif);
    writeFileSync(`${job.out}.webp`, webp);
    process.stdout.write(
      `  ${job.out.split('/').at(-1)}  avif ${(avif.length / 1024).toFixed(1)}KB  webp ${(webp.length / 1024).toFixed(1)}KB\n`,
    );
  }
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const skipPlants = rawArgs.includes('--skip-plants');
  const onlyArg = rawArgs.find((arg) => arg.startsWith('--only='));
  const only = onlyArg?.slice('--only='.length).split(',').filter(Boolean) ?? [];
  const srcDir = rawArgs.find((arg) => !arg.startsWith('--')) ?? DEFAULT_SRC_DIR;
  const foliageDir = join(repoRoot, 'apps/web/src/app/greenhouse/foliage');
  const atmosphereDir = join(repoRoot, 'apps/web/src/app/greenhouse/atmosphere');
  mkdirSync(foliageDir, { recursive: true });

  const run = (name: string) => only.length === 0 || only.includes(name);
  if (run('repair')) {
    await repairExistingFoliage(foliageDir);
    if (only.length === 1) {
      return;
    }
  }
  if (run('1x')) {
    await encodeOneXFromExisting(atmosphereDir, foliageDir);
    if (only.length === 1) {
      return;
    }
  }
  if (run('plates')) {
    await encodeBackPlates(srcDir, atmosphereDir);
  }
  if (run('edges')) {
    await encodeEdges(srcDir, foliageDir);
  }
  if (run('band')) {
    await encodeBottomBand(srcDir, foliageDir);
  }
  if (!skipPlants && run('plants')) {
    for (const name of PLANTS) {
      await processPlant(name, srcDir, foliageDir);
    }
  }
  for (const stale of [
    'thicket-1536.avif',
    'thicket-1536.webp',
    'thicket-768.avif',
    'thicket-768.webp',
    'bottom-band.avif',
    'bottom-band.webp',
  ]) {
    unlinkQuiet(join(foliageDir, stale));
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
