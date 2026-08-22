#!/usr/bin/env tsx
/**
 * Key, despill, and encode greenhouse plant cutouts.
 *
 * Sources are 1024–1536 RGB PNGs on flat #FF00FF. They are 1.8–2.5MB each
 * and must stay out of git. Read them from the shared store (or override):
 *
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/plant-src-monstera.png
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/plant-src-bop.png
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/plant-src-calathea.png
 *   /cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media/plant-src-nerve.png
 *
 * Optional argv[2] overrides the source directory. Emits 1024w + 768w
 * lossy AVIF-with-alpha and WebP q65 into apps/web/src/app/greenhouse/foliage/.
 *
 * Usage (from repo root, sharp resolved via @dg/ui):
 *   pnpm --filter @dg/web exec tsx ../../scripts/greenhouse-assets.ts
 *   pnpm --filter @dg/web exec tsx ../../scripts/greenhouse-assets.ts /path/to/sources
 */
import { mkdirSync, writeFileSync } from 'node:fs';
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

async function encodeWidth(raw: Rgba, width: number, outBase: string): Promise<void> {
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

async function processPlant(name: string, srcDir: string, outDir: string): Promise<void> {
  const src = join(srcDir, `plant-src-${name}.png`);
  const image = sharp(src).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) {
    throw new Error(`${src} must be RGBA after ensureAlpha (got ${info.channels})`);
  }

  const keyed = keyAndDespill({ data, height: info.height, width: info.width });
  const eroded = erodeAlpha(keyed, 1);
  const feathered = featherAlpha(eroded);

  process.stdout.write(`${name} ${info.width}×${info.height}\n`);
  await encodeWidth(feathered, 1024, join(outDir, `${name}-1024`));
  await encodeWidth(feathered, 768, join(outDir, `${name}-768`));
}

async function main(): Promise<void> {
  const srcDir = process.argv[2] ?? DEFAULT_SRC_DIR;
  const outDir = join(repoRoot, 'apps/web/src/app/greenhouse/foliage');
  mkdirSync(outDir, { recursive: true });

  for (const name of PLANTS) {
    await processPlant(name, srcDir, outDir);
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
