#!/usr/bin/env tsx
/**
 * Key, despill, and encode greenhouse rasters.
 *
 * Sources stay out of git (they are 1–3MB PNGs). Default directory:
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media
 *
 * Required dedicated sources:
 *   plant-src-{monstera,bop,calathea,nerve,pothos,zz,prayer,monstera-side}.png
 *   spike-glass-plate.png (landscape), plate-src-portrait.png
 *
 * Despill is hue-limited so BOP orange and fittonia pink stay saturated.
 * Edges erode 1px.
 *
 * Emits:
 *   atmosphere/back-plate-1536, -2560, -960, and -768 (landscape)
 *   atmosphere/back-plate-portrait and -portrait-768
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

const PLANTS = ['monstera', 'bop', 'calathea', 'nerve', 'pothos', 'zz', 'prayer'] as const;

/** Trailing cutouts are leafier; drop AVIF quality so the set stays ≤ 400KB. */
const PLANT_QUALITY: Partial<Record<(typeof PLANTS)[number], number>> = {
  pothos: 22,
  zz: 26,
};

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

async function encodeKeyedWidth(
  raw: Rgba,
  width: number,
  outBase: string,
  quality = 40,
): Promise<void> {
  const pipeline = () =>
    sharp(raw.data, { raw: { channels: 4, height: raw.height, width: raw.width } }).resize(
      width,
      null,
      { fit: 'inside', withoutEnlargement: true },
    );

  const avif = await pipeline().avif({ chromaSubsampling: '4:4:4', effort: 7, quality }).toBuffer();
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
  resize: { allowEnlarge?: boolean; kernel?: 'lanczos3' } = {},
): Promise<void> {
  const resized = sharp(src)
    .resize(width, null, {
      fit: 'inside',
      kernel: resize.kernel ?? 'lanczos3',
      withoutEnlargement: resize.allowEnlarge !== true,
    })
    .sharpen(resize.allowEnlarge === true ? { m1: 0.6, m2: 0.4, sigma: 0.8 } : undefined);
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
    2560,
    join(outDir, 'back-plate-2560'),
    {
      max: 95,
      min: 82,
    },
    { allowEnlarge: true, kernel: 'lanczos3' },
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

async function processPlant(name: string, srcDir: string, outDir: string): Promise<void> {
  const src = join(srcDir, `plant-src-${name}.png`);
  const keyed = await loadKeyedSource(src);
  process.stdout.write(`${name} ${keyed.width}×${keyed.height}\n`);
  const quality = PLANT_QUALITY[name as (typeof PLANTS)[number]] ?? 40;
  await encodeKeyedWidth(keyed, 1024, join(outDir, `${name}-1024`), quality);
  await encodeKeyedWidth(keyed, 768, join(outDir, `${name}-768`), quality);
}

async function encodeOneXFromExisting(atmosphereDir: string): Promise<void> {
  process.stdout.write('1x ladder from existing 2x encodes\n');
  const jobs: Array<{ src: string; width: number; out: string }> = [
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
  ];
  for (const job of jobs) {
    if (!existsSync(job.src)) {
      throw new Error(`missing ${job.src}`);
    }
    const pipeline = sharp(job.src).resize({
      fit: 'inside',
      width: job.width,
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

const STALE_FOLIAGE = [
  'thicket-1536.avif',
  'thicket-1536.webp',
  'thicket-768.avif',
  'thicket-768.webp',
  'bottom-band.avif',
  'bottom-band.webp',
  'bottom-band-768.avif',
  'bottom-band-768.webp',
  'bottom-band-1024.avif',
  'bottom-band-1024.webp',
  'bottom-band-1536.avif',
  'bottom-band-1536.webp',
  'edge-left-768.avif',
  'edge-left-768.webp',
  'edge-left-900.avif',
  'edge-left-900.webp',
  'edge-left-1536.avif',
  'edge-left-1536.webp',
  'edge-right-768.avif',
  'edge-right-768.webp',
  'edge-right-900.avif',
  'edge-right-900.webp',
  'edge-right-1536.avif',
  'edge-right-1536.webp',
  'monstera-side-768.avif',
  'monstera-side-768.webp',
  'monstera-side-1024.avif',
  'monstera-side-1024.webp',
];

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
  if (run('1x')) {
    await encodeOneXFromExisting(atmosphereDir);
    if (only.length === 1) {
      return;
    }
  }
  if (run('plates')) {
    await encodeBackPlates(srcDir, atmosphereDir);
  }
  const plantOnly =
    rawArgs
      .find((arg) => arg.startsWith('--plant='))
      ?.slice('--plant='.length)
      .split(',')
      .filter(Boolean) ?? [];
  if (!skipPlants && run('plants')) {
    for (const name of PLANTS) {
      if (plantOnly.length > 0 && !plantOnly.includes(name)) {
        continue;
      }
      await processPlant(name, srcDir, foliageDir);
    }
  }
  for (const stale of STALE_FOLIAGE) {
    unlinkQuiet(join(foliageDir, stale));
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
